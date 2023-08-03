
import { loadStripe } from '@stripe/stripe-js'
import { placeOrder } from './apiService';

export async function initStripe() {
    const stripe = await loadStripe('pk_test_51N9NbHSF48dfRZC3dLQVTY52TaiKgrRsUsS8sWl8uLyswwHG2F6gURNahsSsfGChn8jchMCeJO1o2JrP5zLAKjwF00PzsWFkRK');
    let card = null;
    function mountWidget() {
        const elements = stripe.elements()

        let style = {
            base: {
                color: '#32325d',
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                fontSmoothing: 'antialiased',
                fontSize: '16px',
                '::placeholder': {
                    color: '#aab7c4'
                }
            },
            invalid: {
                color: '#fa755a',
                iconColor: '#fa755a'
            }
        };
        card = elements.create('card', { style, hidePostalCode: true })
        card.mount('#card-element');
    }
    const paymentType = document.querySelector('#paymentType');
    if (!paymentType) {
        return;
    }
    paymentType.addEventListener('change', (e) => {
        console.log(e.target.value);
        if (e.target.value === 'card') {
            mountWidget()
        } else {
            card.destroy()
        }
    })
    // ajax call for form 
    const paymentForm = document.querySelector('#payment-form');

    if (paymentForm) {
        paymentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            let formData = new FormData(paymentForm);
            let formObject = {}
            for (let [key, value] of formData.entries()) {
                formObject[key] = value;
            }
            if (!card) {
                // Ajax
                placeOrder(formObject);
                console.log(formObject);
                return;
            }
            //verify our card
            stripe.createToken(card).then((result) => {
             
                formObject.stripeToken = result.token.id;
                placeOrder(formObject);
            }).catch((err) => {
                console.log(err);
            })

        })
    }

}


