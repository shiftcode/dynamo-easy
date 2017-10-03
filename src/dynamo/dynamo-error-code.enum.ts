export enum DynamoErrorCode {
  /*
    Message: Access denied.

    The client did not correctly sign the request. If you are using an AWS SDK, requests are signed for you automatically; otherwise, go to the Signature Version 4 Signing Process in the AWS General Reference.

    OK to retry? No
    */
  AccessDeniedException,

  /*Message: The conditional request failed.

    You specified a condition that evaluated to false. For example, you might have tried to perform a conditional update on an item, but the actual value of the attribute did not match the expected value in the condition.

    OK to retry? No
    */
  ConditionalCheckFailedException,

  /*
  Message: The request signature does not conform to AWS standards.

    The request signature did not include all of the required components. If you are using an AWS SDK, requests are signed for you automatically; otherwise, go to the Signature Version 4 Signing Process in the AWS General Reference.

    OK to retry? No
    */
  IncompleteSignatureException,

  /*
  Message: Collection size exceeded.

    For a table with a local secondary index, a group of items with the same partition key value has exceeded the maximum size limit of 10 GB. For more information on item collections, see Item Collections.

    OK to retry? Yes
    */
  ItemCollectionSizeLimitExceededException,

  /*
  Message: Too many operations for a given subscriber.

    There are too many concurrent control plane operations. The cumulative number of tables and indexes in the CREATING, DELETING or UPDATING state cannot exceed 10.

  OK to retry? Yes
  */
  LimitExceededException,

  /*
  Message: Request must contain a valid (registered) AWS Access Key ID.

    The request did not include the required authorization header, or it was malformed. See DynamoDB Low-Level API.

    OK to retry? No
    */
  MissingAuthenticationTokenException,

  /*
  Message: You exceeded your maximum allowed provisioned throughput for a table or for one or more global secondary indexes. To view performance metrics for provisioned throughput vs. consumed throughput, open the Amazon CloudWatch console.

    Example: Your request rate is too high. The AWS SDKs for DynamoDB automatically retry requests that receive this exception. Your request is eventually successful, unless your retry queue is too large to finish. Reduce the frequency of requests, using Error Retries and Exponential Backoff.

    OK to retry? Yes
    */
  ProvisionedThroughputExceededException,

  /*
  Message: The resource which you are attempting to change is in use.

    Example: You tried to recreate an existing table, or delete a table currently in the CREATING state.

    OK to retry? No
    */
  ResourceInUseException,

  /*
  Message: Requested resource not found.

    Example: Table which is being requested does not exist, or is too early in the CREATING state.

    OK to retry? No
  */
  ResourceNotFoundException,

  /*
  Message: Rate of requests exceeds the allowed throughput.

    This exception might be returned if you perform any of the following operations too rapidly: CreateTable; UpdateTable; DeleteTable.

    OK to retry? Yes
    */
  ThrottlingException,

  /*
  Message: The Access Key ID or security token is invalid.

    The request signature is incorrect. The most likely cause is an invalid AWS access key ID or secret key.

    OK to retry? Yes
    */
  UnrecognizedClientException,

  /*
  Message: Varies, depending upon the specific error(s) encountered
  This error can occur for several reasons, such as a required parameter that is missing, a value that is out range, or mismatched data types. The error message contains details about the specific part of the request that caused the error.
  OK to retry? No
  */
  ValidationException,
}
