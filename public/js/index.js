import '@babel/polyfill';
import { signup, login, logout, addToCart, deleteCart, checkout } from './test';
import { updateSettings } from './updateSettings';
import { forgotPassword } from './forgotPassword';
import { resetPassword } from './resetPassword';

// DOM ELEMENTS
const signUpForm = document.querySelector('.frm-signup');
const loginForm = document.querySelector('.form');
const logOutBtn = document.querySelector('.butn--form');
const userDataForm = document.querySelector('.frm-data');
const userPasswordForm = document.querySelector('.frm-password');
const forgotPasswordForm = document.querySelector('.fgtPass');
const resetPasswordForm = document.querySelector('.rstPass');
const addToCartForm = document.querySelector('.crt');
const deleteCartForm = document.querySelector('.dlt');
const checkoutForm = document.querySelector('.chkout');

if (signUpForm)
  signUpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    signup(name, email, password);
  });

if (loginForm)
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });

if (logOutBtn) logOutBtn.addEventListener('submit', logout);

if (userDataForm)
  userDataForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    updateSettings({ name, email }, 'data');
  });

if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );

    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });

if (forgotPasswordForm)
  forgotPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    await forgotPassword(email);
  });

if (resetPasswordForm)
  resetPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const token = document.getElementById('resetToken').value;
    await resetPassword(password, confirmPassword, token);
  });

if (addToCartForm)
  addToCartForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    // alert(2);
    const bookCart = document.getElementById('crt-items').value;
    await addToCart(bookCart);
  });

if (deleteCartForm)
  deleteCartForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const book = document.getElementById('dlt-item').value;
    await deleteCart(book);
  });

if (checkoutForm)
  checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userEmail = document.getElementById('chk-use').value;
    const totalClass = document.querySelector('.totalBill');
    const totalClassText = totalClass.textContent;
    const numValue = parseFloat(totalClassText.replace(/[^0-9.]/g, ''));
    await checkout(userEmail, numValue);
  });
