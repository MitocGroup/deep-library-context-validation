import DeepFramework from 'deep-framework';

export default class DeepContextValidation extends DeepFramework.Core.AWS.Lambda.Runtime {
  constructor(...args) {
    super(...args);

    this.Account = DeepFramework.Kernel.get('db').get('Account');
    this.isLocal = this.kernel.get('fs').localBackend;
  }

  /**
   * Check if user have permissions to access a specific account
   * @param accountId
   * @param callback
   */
  contextValidation(accountId, callback) {
    if (this.isLocal) {
      return callback();
    }

    let userId = this.loggedUserId;

    this.Account.findOneById(accountId, (error, account) => {
      if (error) {

        throw new DeepFramework.Core.Exception.DatabaseOperationException(error);
      }

      if (account.Users.indexOf(userId) === -1) {
        return this.createError('You don\'t have permissions for this account').send();
      }

      return callback(null);
    });
  }
}