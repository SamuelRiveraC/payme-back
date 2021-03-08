"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class OpenBankingProvider {
    constructor(application) {
        this.application = application;
    }
    register() {
    }
    async boot() {
    }
    async ready() {
    }
    async shutdown() {
    }
}
exports.default = OpenBankingProvider;
function authorizationBank() {
}
function AIS() {
    var request = require("request");
    try {
        let bank = "test";
        let userAccount = {};
        switch (bank) {
            case "payme":
                break;
            case "deutschebank":
                var options = { method: 'GET',
                    url: 'https://api-sandbox.rabobank.nl/openapi/sandbox/payments/account-information/ais/accounts/REPLACE_ACCOUNT-ID',
                    headers: { accept: 'application/json',
                        date: 'REPLACE_THIS_VALUE',
                        signature: 'REPLACE_THIS_VALUE',
                        digest: 'REPLACE_THIS_VALUE',
                        'x-request-id': 'REPLACE_THIS_VALUE',
                        'psu-ip-address': 'REPLACE_THIS_VALUE',
                        'tpp-signature-certificate': 'MIIDkDCCAnigAwIBAgIEWs3AJDANBgkqhkiG9w0BAQsFADCBiTELMAkGA1UEBhMCTkwxEDAOBgNVBAgMB1V0cmVjaHQxEDAOBgNVBAcMB1V0cmVjaHQxETAPBgNVBAoMCFJhYm9iYW5rMRwwGgYDVQQLDBNPbmxpbmUgVHJhbnNhY3Rpb25zMSUwIwYDVQQDDBxQU0QyIEFQSSBQSSBTZXJ2aWNlcyBTYW5kYm94MB4XDTE4MDQxMTA3NTgyOFoXDTIzMDQxMTA3NTgyOFowgYkxCzAJBgNVBAYTAk5MMRAwDgYDVQQIDAdVdHJlY2h0MRAwDgYDVQQHDAdVdHJlY2h0MREwDwYDVQQKDAhSYWJvYmFuazEcMBoGA1UECwwTT25saW5lIFRyYW5zYWN0aW9uczElMCMGA1UEAwwcUFNEMiBBUEkgUEkgU2VydmljZXMgU2FuZGJveDCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBANoAjqGWUgCIm2F+0sBSEwLal+T3u+uldLikpxHCB8iL1GD7FrRjcA+MVsxhvHly7vRsHK+tQyMSaeK782RHpY33qxPLc8LmoQLb2EuiQxXj9POYkYBQ74qkrZnvKVlR3WoyQWeDOXnSY2wbNFfkP8ET4ElwyuIIEriwYhab0OIrnnrO8X82/SPZxHwEd3aQjQ6uhiw8paDspJbS5WjEfuwY16KVVUYlhbtAwGjvc6aK0NBm+LH9fMLpAE6gfGZNy0gzMDorVNbkQK1IoAGD8p9ZHdB0F3FwkILEjUiQW6nK+/fKDNJ0TBbpgZUpY8bR460qzxKdeZ1yPDqX2Cjh6fkCAwEAATANBgkqhkiG9w0BAQsFAAOCAQEAYL4iD6noMJAt63kDED4RB2mII/lssvHhcxuDpOm3Ims9urubFWEpvV5TgIBAxy9PBinOdjhO1kGJJnYi7F1jv1qnZwTV1JhYbvxv3+vk0jaiu7Ew7G3ASlzruXyMhN6t6jk9MpaWGl5Uw1T+gNRUcWQRR44g3ahQRIS/UHkaV+vcpOa8j186/1X0ULHfbcVQk4LMmJeXqNs8sBAUdKU/c6ssvj8jfJ4SfrurcBhY5UBTOdQOXTPY85aU3iFloerx7Oi9EHewxInOrU5XzqqTz2AQPXezexVeAQxP27lzqCmYC7CFiam6QBr06VebkmnPLfs76n8CDc1cwE6gUl0rMA==',
                        authorization: 'Bearer REPLACE_BEARER_TOKEN',
                        'x-ibm-client-id': 'Client ID' } };
                request(options, function (error, response, body) {
                    if (error)
                        return console.error('Failed: %s', error.message);
                    userAccount.alias = body.accounts[0].accountType;
                    userAccount.iban = body.accounts[0].iban;
                    userAccount.bic = body.accounts[0].bic;
                    userAccount.balance = body.accounts[0].currentBalance;
                    userAccount.expires_at = `${new Date(new Date().getFullYear(), new Date().getMonth() + 3, new Date().getDate()).toLocaleString()}`;
                });
                break;
            case "rabobank":
                var options = { method: 'GET',
                    url: 'https://api-sandbox.rabobank.nl/openapi/sandbox/payments/account-information/ais/accounts/REPLACE_ACCOUNT-ID',
                    headers: { accept: 'application/json',
                        date: 'REPLACE_THIS_VALUE',
                        signature: 'REPLACE_THIS_VALUE',
                        digest: 'REPLACE_THIS_VALUE',
                        'x-request-id': 'REPLACE_THIS_VALUE',
                        'psu-ip-address': 'REPLACE_THIS_VALUE',
                        'tpp-signature-certificate': 'MIIDkDCCAnigAwIBAgIEWs3AJDANBgkqhkiG9w0BAQsFADCBiTELMAkGA1UEBhMCTkwxEDAOBgNVBAgMB1V0cmVjaHQxEDAOBgNVBAcMB1V0cmVjaHQxETAPBgNVBAoMCFJhYm9iYW5rMRwwGgYDVQQLDBNPbmxpbmUgVHJhbnNhY3Rpb25zMSUwIwYDVQQDDBxQU0QyIEFQSSBQSSBTZXJ2aWNlcyBTYW5kYm94MB4XDTE4MDQxMTA3NTgyOFoXDTIzMDQxMTA3NTgyOFowgYkxCzAJBgNVBAYTAk5MMRAwDgYDVQQIDAdVdHJlY2h0MRAwDgYDVQQHDAdVdHJlY2h0MREwDwYDVQQKDAhSYWJvYmFuazEcMBoGA1UECwwTT25saW5lIFRyYW5zYWN0aW9uczElMCMGA1UEAwwcUFNEMiBBUEkgUEkgU2VydmljZXMgU2FuZGJveDCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBANoAjqGWUgCIm2F+0sBSEwLal+T3u+uldLikpxHCB8iL1GD7FrRjcA+MVsxhvHly7vRsHK+tQyMSaeK782RHpY33qxPLc8LmoQLb2EuiQxXj9POYkYBQ74qkrZnvKVlR3WoyQWeDOXnSY2wbNFfkP8ET4ElwyuIIEriwYhab0OIrnnrO8X82/SPZxHwEd3aQjQ6uhiw8paDspJbS5WjEfuwY16KVVUYlhbtAwGjvc6aK0NBm+LH9fMLpAE6gfGZNy0gzMDorVNbkQK1IoAGD8p9ZHdB0F3FwkILEjUiQW6nK+/fKDNJ0TBbpgZUpY8bR460qzxKdeZ1yPDqX2Cjh6fkCAwEAATANBgkqhkiG9w0BAQsFAAOCAQEAYL4iD6noMJAt63kDED4RB2mII/lssvHhcxuDpOm3Ims9urubFWEpvV5TgIBAxy9PBinOdjhO1kGJJnYi7F1jv1qnZwTV1JhYbvxv3+vk0jaiu7Ew7G3ASlzruXyMhN6t6jk9MpaWGl5Uw1T+gNRUcWQRR44g3ahQRIS/UHkaV+vcpOa8j186/1X0ULHfbcVQk4LMmJeXqNs8sBAUdKU/c6ssvj8jfJ4SfrurcBhY5UBTOdQOXTPY85aU3iFloerx7Oi9EHewxInOrU5XzqqTz2AQPXezexVeAQxP27lzqCmYC7CFiam6QBr06VebkmnPLfs76n8CDc1cwE6gUl0rMA==',
                        authorization: 'Bearer REPLACE_BEARER_TOKEN',
                        'x-ibm-client-id': 'Client ID' } };
                request(options, function (error, response, body) {
                    if (error)
                        return console.error('Failed: %s', error.message);
                    userAccount.iban = body.account.iban;
                    userAccount.bic = body.account.iban;
                    userAccount.balance = body.balances[0].balanceAmount.amount;
                    userAccount.expires_at = `${new Date(new Date().getFullYear(), new Date().getMonth() + 3, new Date().getDate()).toLocaleString()}`;
                });
                break;
            case "neonomics":
                userAccount.iban = body.iban;
                userAccount.iban = body.iban;
                userAccount.balance = body.balances[0].amount;
                userAccount.alias = body.accountName;
                userAccount.expires_at = `${new Date(new Date().getFullYear(), new Date().getMonth() + 3, new Date().getDate()).toLocaleString()}`;
                break;
            case "klarna":
                break;
            default:
                break;
        }
    }
    catch (e) {
    }
}
//# sourceMappingURL=OpenBankingProvider.js.map