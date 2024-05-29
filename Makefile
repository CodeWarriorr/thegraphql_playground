
task1: 
	@node_modules/.bin/ts-node src/task1.ts $(n)

task2:
	@node_modules/.bin/ts-node src/task2.ts $(n) $(i)

deploygraph:
	@cd grapg-usdb && yarn codegen && yarn build && yarn deploy

buildgraph:
	@node_modules/.bin/graphclient build