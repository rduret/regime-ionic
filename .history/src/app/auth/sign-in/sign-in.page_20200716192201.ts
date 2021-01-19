import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Platform, IonRouterOutlet } from '@ionic/angular';
import { Plugins } from '@capacitor/core';

const { App } = Plugins;


@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.page.html',
  styleUrls: ['./sign-in.page.scss'],
})
export class SignInPage implements OnInit {

  signInForm: FormGroup;

  emailSignInFormControl: FormControl;
  passwordSignInFormControl: FormControl;

  errorMessageSignIn: string;

  constructor(
    private authService: AuthService,
    private router: Router,
    private formBuilder: FormBuilder,
    private platform: Platform,
    private routerOutlet: IonRouterOutlet,
    ) { }

  ngOnInit() {
    this.platform.backButton.subscribeWithPriority(10,() => {
      if(!this.routerOutlet.canGoBack())
        App.exitApp();
      else
        this.routerOutlet.pop();
    });

    this.initForm();
  }

  initForm() {
    //signin form
    this.emailSignInFormControl = new FormControl('' , [Validators.required, Validators.email])
    this.passwordSignInFormControl = new FormControl('' , [Validators.required, Validators.pattern(/[0-9a-zA-Z]{6,}/)])
    
    this.signInForm = this.formBuilder.group({
      emailSignIn: this.emailSignInFormControl,
      passwordSignIn: this.passwordSignInFormControl
    });
  }

  signIn(){
    const emailSignIn = this.signInForm.get('emailSignIn').value;
    const passwordSignIn = this.signInForm.get('passwordSignIn').value;

    this.authService.signInUser(emailSignIn, passwordSignIn).then(
      () => {
        this.router.navigate(['/mon-suivi']);
      },
      (error) => {
        console.log(error)
        this.errorMessageSignIn = this.authService.translateError(error);
      }
    )
   }
}
