/* eslint-disable */
import '@babel/polyfill';
import { login, logout } from './login';
import { updateUserData, updateUserPassword } from './updateUserData';
import { bookTour } from './stripe';

// DOM ELEMENTS
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password')
const bookBtn = document.getElementById('book-tour');

// DELEGATION
// LOGIN
if (loginForm) {
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    });
};

// LOGOUT
if (logOutBtn) logOutBtn.addEventListener('click', logout);

// USER UPDATE DATA
if (userDataForm) {
    userDataForm.addEventListener('submit', e => {
        e.preventDefault();
        const form = new FormData();
        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('photo', document.getElementById('photo').files[0]);
        updateUserData(form);
    });
}

// UPDATE LOGGED USER PASSWORD
if (userPasswordForm) {
    userPasswordForm.addEventListener('submit', e => {
        e.preventDefault();
        document.querySelector('.btn--save-password').textContent = 'Updating...';

        const currentPassword = document.getElementById('password-current').value;
        const newPassword = document.getElementById('password').value;
        const newPasswordConfirm = document.getElementById('password-confirm').value;
        updateUserPassword(currentPassword, newPassword, newPasswordConfirm);

        document.querySelector('.btn--save-password').textContent = 'Save password';
        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';
    });
}

// BOOKING BUTTON
if (bookBtn) {
    bookBtn.addEventListener('click', e => {
        e.target.textContent = 'Processing...';
        const { tourId } = e.target.dataset;
        bookTour(tourId);
    });
}
