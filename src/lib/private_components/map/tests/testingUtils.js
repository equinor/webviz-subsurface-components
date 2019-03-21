/* eslint-disable import/prefer-default-export */

export const cleanUpDOM = () => {
    document.getElementsByTagName('html')[0].innerHTML = '';
};
