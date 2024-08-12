/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

export const signup = async (name, email, password) => {
  console.log(name, email, password);
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/signup',
      data: {
        name,
        email,
        password,
      },
    });

    if (res.data.status === 'success') {
      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
      console.log('hokm', res.data);
    }
  } catch (err) {
    showAlert('error', 'Error, please try again later');
    console.log('error', err.response);
  }
};

export const login = async (email, password) => {
  console.log(email, password);

  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    if (res.data.status === 'success') {
      console.log('', res.data);
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
      // console.log('',res.data)
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
    console.log('errr', err.response.data);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:3000/api/v1/users/logout',
    });
    if ((res.data.status = 'success')) location.reload(true);
  } catch (error) {
    showAlert('error', 'Error logging out! Try again.');
  }
};

export const addToCart = async (bookId) => {
  let quantity = 1;
  let iconCartSpan = document.querySelector('.crt-num');
  iconCartSpan.textContent = quantity;
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/createCart',
      data: { bookId, quantity },
    });
    if (res.data.status === 'success') {
      console.log('Book added successfully', res);
    }
  } catch (err) {
    showAlert('error', 'Error adding cart');
  }
};

export const deleteCart = async (book) => {
  try {
    const res = await axios({
      method: 'DELETE',
      url: `http://127.0.0.1:3000/api/v1/users/emptyCart?bookId=${book}`,
      data: { book },
    });
    if ((res.data.status = 'success')) location.reload(true);
  } catch (error) {
    showAlert('error', 'Error removing cart');
  }
};
