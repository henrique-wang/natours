import axios from 'axios';
import { showAlert } from './alerts';

export const updateUserData = async (data) => {
    console.log(`photo: ${photo}`);
    try {
        const res = await axios({
            method: 'PATCH',
            url: 'http://127.0.0.1:3001/api/v1/users/update-logged-user',
            data
        });
        if ((res.data.status === 'success')) {
            showAlert('success', `User data updated successfully!`);
            location.reload(true);
        }
    } catch (error) {
        showAlert('error', error.response.data.message);
    }
};

export const updateUserPassword = async (currentPassword, newPassword, newPasswordConfirm) => {
    try {
        const res = await axios({
            method: 'PATCH',
            url: 'http://127.0.0.1:3001/api/v1/users/update-password',
            data: {
                currentPassword,
                password: newPassword,
                passwordConfirm: newPasswordConfirm
            }
        });
        if ((res.data.status === 'success')) {
            showAlert('success', `User password updated successfully!`);
        }
    } catch (error) {
        showAlert('error', error.response.data.message);
    }
}