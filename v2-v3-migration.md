# Migrate dynamo-easy to aws-sdk v3

## 📋 To complete before releasing
- [x] Make sure the snippets compile
- [x] Make tests compile and run successfully
- [ ] Search for `TODO v3:` in the code to see open issues / notes, and create followup issues to decide if we have more to fix prior to a major release or keep it for later follow-up
- [ ] Check on new attribute type [$UnknownAttribute](./src/mapper/type/attribute.type.ts) and implement tests
- [ ] Remove [sessionValidityEnsurer](./src/config/dynamo-easy-config.ts) and add demo with using [middleware stack](https://github.com/aws/aws-sdk-js-v3#middleware-stack)
  to implement the same
  - [ ] The old behavior (sessionValidityEnsurer) was executed before every request, with the new implementation we
    only react to failing requests, so we should probably provide a way to automatically retry failed requests after
    successfully refreshing any invalid session.
- [ ] Switch to new implementation of pagination, see [official doc](https://github.com/aws/aws-sdk-js-v3#paginators).
- [ ] Use middleware stack to implement verbose logging of request / response data
- [ ] Update [dynamo-easy-demo](https://github.com/shiftcode/dynamo-easy-demo) see [this](https://github.com/shiftcode/dynamo-easy-demo/issues/1) issue

## Useful Links

- [Doc in Repo](https://github.com/aws/aws-sdk-js-v3)
- [Official migration Guide](https://github.com/aws/aws-sdk-js-v3/blob/main/UPGRADING.md)

