# Internal module contract
No runtime dependencies, relative ES modules. Each author owns assigned files.

Content modules `js/content-points.js` and `js/content-crypto.js` export `quests`, `steps`, `chapters`, `bosses`, `objectives` arrays. Steps retain every specification ID and one actual user action per step, never bulk completion.

Quest: {id,partId:'intro'|'points'|'crypto',chapterId:'CH-0'..'CH-6',title,requesterId,prerequisites:questIds[],scenarioId,stepIds:[],guidedObjectiveMap:{objectiveIndex:stepId},completionRule:'all-steps',bossLink,reward:40,timedChallenge:{enabled:true,durationHours:24},reviewVariant:{...}}. Extra quests BK-02-R and FX-02-S use extra:true,reward:0,timedChallenge.enabled:false. Intro time disabled. HY-EXIT route prerequisites resolved by engine.

Step: {id,questId,screenId,appId:'memo'|'mail'|'browser'|'bank'|'fx'|'market'|'wallet'|'hyper',tabId,instruction,targetAction,label,type:'tap'|'focus'|'input'|'select'|'check'|'confirm'|'wait',field?,value?,choices?:[{label,value}],details?:string[],result,preconditions:[],completionRule:'action',nextStepIds:[],equivalentRoutes:[],checkpoint,hintIds:[],effect?:string}. Inputs need fixed practice values; numeric keyboard may be used. Selects need actual options, labels Japanese. Buttons should reflect action text from spec (not a universal next/complete).

Chapter {id,title,subtitle,npcId,npcName,dialogue,area,color,equipment:{id,name,slot:'weapon'|'shield'|'head'|'tool',description},questIds}. Boss {chapterId,name,tasks:[{id,title,instruction,fields:[{key,label,type:'number'|'select'|'text',value,choices?:[{label,value}]}],details:[],answer?:...}]} exactly 5 tasks per chapter (hidden 6). Boss fields must allow incorrect state and repair, independent snapshot; no three-choice quiz skins. `objectives` {domain,names:[5 strings],questIds:[]}.

Content effect codes will be interpreted by finance.js. Export optional `applyContentEffect(state, step, value, context)` to implement scenario events in module, pure synchronous, mutates draft only, throws user-facing Error on invalid. `context.routeId` supplied. Can use named `step.effect` or own ID switch.

Core finance.js exports `initialScenarios()`, `applyFinancialStep(state,step,value,context={})`, `validateFinancialState(scenarios)`, pure math helpers. State financialScenarios[scenarioId]={initialSnapshot,eventLog:[],simulationTime:0,accounts:{...},phoneState:{}}. All event IDs stable per scenario+route; effects idempotent. UI may show accounts via Object.entries; use readable labels or export scenarioSummary.

Parent implements engine.js, app.js, world.js, index.html/style.css. Parent state uses schemaVersion:3,contentVersion,revision,unlockedParts,worldState,questStates,rewardEvents:[{id,xp}],masteryEvidence:{domain:{guided:[],transfer:[]}},inventory:[],equippedItems,financialScenarios,phoneState:{activeApp,recentApps,mailById,notifications,clipboard,keyboard,browserTabs,formDrafts,scrollPositions},settings,realClockState. Engine creates fresh, starts quests, validates each action using data, awards steps, calls finance plus content effect before commit, grants mastery per maps, and persists.
