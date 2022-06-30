import logo from './resources/logo.png';
import 'bulma/css/bulma.css';
import './css/App.css';
import { Routes, Route, Link, Outlet } from "react-router-dom";
import { Formik, Field, Form } from 'formik';
import {useDispatch, useSelector} from 'react-redux'
import {notificationActions} from './store/notification-slice.js'
import { Navbar } from './components/Navbar';
import { Leagues } from './components/Leagues';
import { Matches } from './components/Matches';
import { Bets } from './components/Bets';
import { Cart } from './components/Cart';
import { Notification } from './components/Notification';

const titlecolor = 'white';

function App() {
  const dispatch = useDispatch();
  const notification = useSelector(state => state.notification.notification)
  return (
    <div className='app-flexbox-container'>
      <div className='notification-container'>
        <Notification/>
      </div>
      <Navbar/>
      {
        // notification.open && <Notification type={notification.type} message={notification.message}></Notification>
      }
      <div className='main-flexbox-container'>
        <Leagues/>
        <Routes>
          <Route path="/" element={<Matches/>}/>
          <Route path="/bets" element={<Bets/>}/>
        </Routes> 
        <Cart/>
      </div>
      {/* <Menu/>
        <Routes>
          <Route path="/login" element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>
          <Route path="/publish" element={<Recipe/>}/>
          <Route path="/search" element={<Search/>}/>
          <Route path="/all-recipies" element={<AllRecipies/>}/>
          <Route path="/all-users" element={<AllUsers/>}/>
          <Route path="/all-recipies/edit/:id" element={<Edit/>}/>
          <Route path="/all-users/edit/:id" element={<EditUser/>}/>

        </Routes> */}
    </div>
  );
}

function Login() {
  return ( 
    <div>
    <h1>Login</h1>
    <Formik
       initialValues={{ username: '', password: '' }}
       validate={values => {
         const errors = {};
        if (!values.username){
           errors.username = 'Required';
        } else if (!values.password){
          errors.password = 'Required';
        } else if (values.username.length > 15){
          errors.username = 'Too long';
        } else if (values.password.length < 8){
          errors.password = 'Too short';
        } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(values.password)){
          errors.password = 'Special character required';
        } else if (!/\d/.test(values.password)){
          errors.password = 'Digit required';
        } 
         console.log(errors); 
         return errors;
       }}
       
       onSubmit={(values) => {
          
          let loginUsr = {};

          loginUsr.username = values.username;
          loginUsr.password = values.password;

          fetch(`http://localhost:9000/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginUsr)
          })
          .then(user => 
            user.json()
          )
          .then( data => 
            localStorage.setItem('active-user', data.user.id)
            // console.log(data.user.id)
          )


          // Object.keys(localStorage).forEach(function(userId){
          //   let username = '', password = '';
          //   let obj = new Object;
          //   if(userId !== 'active-user'){
          //     obj = JSON.parse(localStorage.getItem(userId));
          //   }
          //   if(obj.type && obj.username && obj.password){ 
          //     if(obj.type === 'user'){
          //       username = obj.username;
          //       password = obj.password;
          //     }
          //   }
          //   if(username === values.username && password === values.password){
          //     console.log(userId);
          //     localStorage.setItem('active-user', userId);
          //   }
          // });
       }}
     >

         <Form>
            <label htmlFor="username">Username</label>
            <Field id="username" name="username" placeholder="Jane" />
            <label htmlFor="password">Password</label>
            <Field id="password" name="password" placeholder="Password" />
            
            <button type="submit">Submit</button>
         </Form>
     </Formik>
     </div>
  );
}

function Register() {
  return (
    <div>
    <h1>Register</h1>
    <Formik
       initialValues={{ name: '', username: '', password: '', gender: '', role: 'user', img: '', description: '', status: 'active' }}
       validate={values => {
         const errors = {};
         if (!values.name) {
           errors.name = 'Required';
         } else if (!values.username){
           errors.username = 'Required';
         } else if (!values.password){
          errors.password = 'Required';
        } else if (!values.gender){
          errors.gender = 'Required';
        } else if (!values.description){
          errors.description = 'Required';
        } else if (values.username.length > 15){
          errors.username = 'Too long';
        } else if (values.password.length < 8){
          errors.password = 'Too short';
        } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(values.password)){
          errors.password = 'Special character required';
        } else if (!/\d/.test(values.password)){
          errors.password = 'Digit required';
        } else if (values.role !== 'User' && values.role !== 'Admin'){
          errors.role = 'Wrong role';
        } else if (values.description.length > 512){
          errors.description = 'Too long';
        }
         console.log(errors); 
         return errors;
       }}
       
       onSubmit={(values) => {
        if(!values.img){
          if(values.gender === 'M'){
            values.img = 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bWFsZSUyMHN5bWJvbHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60';
          }
          else if(values.gender === 'F'){
            values.img = 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTl8fGZlbWFsZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60';
          }
        }

        let updatedUsr = {};

        updatedUsr.firstName = values.name;
        updatedUsr.lastName = values.name;
        updatedUsr.username = values.username;
        updatedUsr.password = values.password;
        updatedUsr.gender = values.gender;
        updatedUsr.role = values.role;
        updatedUsr.shortDesc = values.description;
        updatedUsr.imageUrl = values.img;

        fetch(`http://localhost:9000/api/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedUsr)
        })

        // let uuid = crypto.randomUUID();
        // var current = new Date();
        // values.dateCreated = current;
        // values.dateUpdated = current;
        console.log(values);
        // localStorage.setItem(uuid, JSON.stringify(values));   
       }}
     >

         <Form>
            <label htmlFor="name">Name</label>
            <Field id="name" name="name" placeholder="Jane Doe" />
            <label htmlFor="username">Username</label>
            <Field id="username" name="username" placeholder="Jane" />
            <label htmlFor="password">Password</label>
            <Field id="password" name="password" placeholder="Jane" />
            <div id="my-radio-group1">Gender</div>
            <div role="group" aria-labelledby="my-radio-group">
              <label>
                <Field type="radio" name="gender" value="M" />
                M
              </label>
              <label>
                <Field type="radio" name="gender" value="F" />
                F
              </label>
            </div>
            <div id="my-radio-group2">Role</div>
            <div role="group" aria-labelledby="my-radio-group2">
              <label>
                <Field type="radio" name="role" value="User" />
                User
              </label>
              <label>
                <Field type="radio" name="role" value="Admin" />
                Admin
              </label>
            </div>
            <label htmlFor="img">Image</label>
            <Field id="img" name="img" placeholder="https://google.com/img.src" />
            <br/>
            <label htmlFor="description">Description</label>
            <Field name="description" as="textarea"/>
            
            <div id="my-radio-group3">Status</div>
            <div role="group" aria-labelledby="my-radio-group3">
              <label>
                <Field type="radio" name="status" value="active" />
                active
              </label>
              <label>
                <Field type="radio" name="status" value="suspended " />
                suspended 
              </label>
              <label>
                <Field type="radio" name="status" value="deactivated " />
                deactivated 
              </label>
            </div>
            
            <button type="submit">Submit</button>
         </Form>
     </Formik>
     </div>
  );
}

function Recipe() {
  return (
    <div>
    <h1>Recipe</h1>
    <Formik
       initialValues={{ name: '', shortDescription: '', time: '', products: '', img: '', longDescription: '', tags: '' }}
       validate={values => {
         const errors = {};
         if (!values.name) {
           errors.name = 'Required';
         } else if (!values.shortDescription){
           errors.shortDescription = 'Required';
         } else if (!values.time){
          errors.time = 'Required';
        } else if (!values.products){
          errors.products = 'Required';
        } else if (!values.img){
          errors.img = 'Required';
        } else if (!values.longDescription){
          errors.longDescription = 'Required';
        } else if (!values.tags){
          errors.tags = 'Required';
        } else if (values.name.length > 80){
          errors.name = 'Too long';
        } else if (values.shortDescription.length > 256){
          errors.shortDescription = 'Too long';
        } else if (values.longDescription.length > 2048){
          errors.longDescription = 'Too long';
        }
         console.log(errors); 
         return errors;
       }}
       
       onSubmit={(values) => {

        let updatedRecipe = {};

                updatedRecipe.title = values.name;
                updatedRecipe.timeToCook = values.time;
                updatedRecipe.products = values.products.split(", ");
                updatedRecipe.longDesc = values.longDescription;
                updatedRecipe.shortDesc = values.shortDescription;
                updatedRecipe.tags = values.tags.split(", ");
                updatedRecipe.imageUrl = values.img;


                let activeId = localStorage.getItem('active-user');

                fetch(`http://localhost:9000/api/users/${activeId}/recipies`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedRecipe)
                })


        // let uuid = crypto.randomUUID();
        // let activeId = localStorage.getItem('active-user');
        // var current = new Date();
        // values.userId = activeId;
        // values.dateCreated = current;
        // values.dateUpdated = current;
        // values.type = 'recipe';
        // console.log(values);
        // localStorage.setItem(uuid, JSON.stringify(values));   
       }}
     >

         <Form>
            <label htmlFor="name">Name</label>
            <Field id="name" name="name" placeholder="name" />
            <label htmlFor="shortDescription">Short Description</label>
            <Field id="shortDescription" name="shortDescription" as="textarea" placeholder="shortDescription" />
            <label htmlFor="time">Time</label>
            <Field type={"number"} id="time" name="time" placeholder="time" />
            <label htmlFor="products">Products</label>
            <Field id="products" name="products" placeholder="products" />
            <label htmlFor="img">Img</label>
            <Field id="img" name="img" placeholder="img" />
            <label htmlFor="longDescription">Long Description</label>
            <Field id="longDescription" name="longDescription" as="textarea" placeholder="longDescription" />
            <label htmlFor="tags">Tags</label>
            <Field id="tags" name="tags" placeholder="tags" />

            <button type="submit">Submit</button>
         </Form>
     </Formik>
     </div>
  );
}



export default App;
