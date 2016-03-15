import DeepFramework from 'deep-framework';

export class DeepContextValidation extends DeepFramework.Core.AWS.Lambda.Runtime {
  constructor(...args) {
    super(...args);

    this.Account = this.kernel.get('db').get('Account');
    this.isLocal = DeepFramework.Core.IS_DEV_SERVER;
  }

  /**
   * Check if user have permissions to access a specific account
   * @param {String} accountId
   * @param {Function} callback
   * @param {Boolean} isOwner
   */
  contextValidation(accountId, callback, isOwner = false) {
    if (this.isLocal) {
      return callback();
    }

    let userId = this.loggedUserId;

    this.Account.findOneById(accountId, (error, account) => {
      if (error) {

        throw new DeepFramework.Core.Exception.DatabaseOperationException(error);
      }

      if (isOwner && account.OwnerId !== userId) {
        return this.createError('You don\'t have permissions for this action on this account').send();
      }

      if (!account || account.Users.indexOf(userId) === -1) {
        return this.createError('You don\'t have permissions for this account').send();
      }

      return callback(null);
    });
  }
}