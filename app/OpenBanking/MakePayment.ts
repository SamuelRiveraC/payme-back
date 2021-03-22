import User from 'App/Models/User'
import Transaction from 'App/Models/Transaction'
import Notification from 'App/Models/Notification'


export default async function MakePayment (user: User,counterParty: User, transaction, type="Payment") {

    console.log(transaction.id, transaction.status == "1", type == "Request" )

    let storedTransaction = {}

    if (transaction.id !== undefined) {
        storedTransaction =  await Transaction.findOrFail(transaction.id)
        storedTransaction.status = transaction.status
        storedTransaction.uuid = transaction.uuid
        storedTransaction.account_sender_id = transaction.account_sender_id
        storedTransaction.account_receiver_id = transaction.account_receiver_id
        await storedTransaction.save()

        if ( type !== "Update") {
            let notification =  await Notification.findByOrFail('transaction_id', storedTransaction.id)
            notification.status = '1'
            await notification.save()
        }

        if (transaction.status == "1") {
            await Notification.create({
                transaction_id: storedTransaction.id,
                user_id: counterParty.id,
                type: type === "Request" ? '0' : '1', 
                status: '0'
            })
        }

    } else {

        storedTransaction = await Transaction.create(transaction)

        if (transaction.status == "1" || type == "Request") {
            //type: 0 request 1 payment
            await Notification.create({
                transaction_id: storedTransaction.id,
                user_id: counterParty.id,
                type: type === "Request" ? '0' : '1', 
                status: '0'
            })
        }
    }

    return {
        first_name: counterParty.first_name,
        last_name: counterParty.last_name,
        profile_picture: counterParty.profile_picture,
        amount: transaction.amount
    }
}