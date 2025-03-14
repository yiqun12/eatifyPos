import React, { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';

function StripeOnboardingButton(props) {

    const createLink = async () => {
        try {
            const functions = getFunctions();
            const createStripeLinkFunction = httpsCallable(functions, 'createStripeLink');
            const payload = {
                store: props.store,
                userID: props.user
            };
            const result = await createStripeLinkFunction(payload);
            //console.log(result.data.url)
            //console.log(result.data.accountId)
            window.location.href = result.data.url;
            //setLink(result.data.url);
            //setAccountId(result.data.accountId);
        } catch (error) {
            console.error("Error creating Stripe link:", error);
        }
    };

    return (
        <div>

            <a style={{cursor:"pointer"}}onClick={createLink} class="stripe-connect">
                <span className='notranslate'>Connect with</span></a>
        </div>
    );
}

export default StripeOnboardingButton;
