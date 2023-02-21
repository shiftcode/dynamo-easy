# Migrate dynamo-easy to sdk v3

## To complete before releasing
- [ ] Update demo
- [ ] Update doc with new snippets

## Useful Links

- [Doc in Repo](https://github.com/aws/aws-sdk-js-v3)
- [Official migration Guide](https://github.com/aws/aws-sdk-js-v3/blob/main/UPGRADING.md)

## Todo
Search for `TODO v3:` to see open issues / notes, here are some more general ones:
- [x] Make sure the snippets compile
- [ ] Check on new attribute type [$UnknownAttribute](./src/mapper/type/attribute.type.ts) and implement tests
- [ ] Add new [demo](https://github.com/shiftcode/dynamo-easy-demo) with aws-cdk
- [x] Make tests compile and run successfully
- [ ] Remove [sessionValidityEnsurer](./src/config/dynamo-easy-config.ts) and add demo with using [middleware stack](https://github.com/aws/aws-sdk-js-v3#middleware-stack) 
to implement the same
- [ ] Switch to new implementation of pagination, see [official doc](https://github.com/aws/aws-sdk-js-v3#paginators).
