const addBooking=document.querySelector('.book-btn');


const foru=document.querySelector('.foru');
const cancell=document.querySelector('.cancell');
cancell.addEventListener('click',function(e){
    e.preventDefault();
    foru.style.display='none';
})
addBooking.addEventListener('click',function(e){
    e.preventDefault();
    foru.style.display='block';
})
