import React from 'react';

import LoginService from '../../services/LoginService';

class LoginComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            username: "",
            password: ""
        };

        this.usernameChange = this.usernameChange.bind(this);
        this.passwordChange = this.passwordChange.bind(this);
        this.loginSubmit = this.loginSubmit.bind(this);
    }

    usernameChange(event) {
        this.setState({username: event.target.value})
    }

    passwordChange(event){
        this.setState({password: event.target.value})
    }

    loginSubmit(){
        LoginService.tryLogin(this.state["username"], this.state["password"]).then(response=>{
            if(response.status == 200) console.log(response.data);
        })
    }

    render() {
        return (
            <div class="row justify-content-center">
                <div class="col-md-7 col-lg-5">
                    <div class="login-wrap p-4 p-md-5">
                        <h3 class="text-center mb-4">Login</h3>
                        <form onSubmit={this.loginSubmit} action="#" class="login-form">
                            <div class="form-group">
                                <input type="text" value={this.state.username} onChange={this.usernameChange} class="form-control rounded-left" placeholder="Username" required="" />
                            </div>
                            <div class="form-group d-flex">
                                <input type="password" value={this.state.password} onChange={this.passwordChange} class="form-control rounded-left" placeholder="Password" required="" />
                            </div>
                            <div class="form-group">
                                <button type="submit" class="form-control btn btn-primary rounded submit px-3">Login</button>
                            </div>
                            <div class="form-group d-md-flex">
                                <div class="w-50">
                                <a href="#">Forgot Password</a>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        )
    }
}

export default LoginComponent