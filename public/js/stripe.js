/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
// const stripe = Stripe('pk_test_BUkd0ZXAj6m0q0jMyRgBxNns00PPtgvjjr');

// TODO: refactor calls to banckend. Detach frontend from backend
export const bookTour = async tourId => {
    try {
        // 1) Get checkout session from API and expect redirect to checkout
        const session = await axios(
            `/api/v1/bookings/checkout-session/${tourId}`
        );

        // 2) Redirect to session.data.redirectTo page (Checkout or Failed Page)
        window.setTimeout(() => {
            location.assign(`${session.data.redirectTo}`);
        }, 500);

    } catch (err) {
        console.log(err);
        showAlert('error', err);
    }
};
