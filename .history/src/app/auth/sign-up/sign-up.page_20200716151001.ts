import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { WeightService } from 'src/app/services/weight.service';
import { Measure } from '../../models/measure.model';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage implements OnInit {

  signInForm: FormGroup;
  emailSignUp: FormGroup;
  passwordSignUp: FormGroup;
  detailsSignUp: FormGroup;

  emailSignInFormControl: FormControl;
  passwordSignInFormControl: FormControl;
  emailSignUpFormControl: FormControl;
  passwordSignUpFormControl: FormControl;
  goalFormControl: FormControl;
  firstWeightFormControl: FormControl;

  errorMessageSignIn: string;
  errorMessageSignUp: string;


  constructor(private authService: AuthService, private weightService: WeightService, private router: Router, private formBuilder: FormBuilder) { }

  ngOnInit() {
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

    //signup form
    this.emailSignUpFormControl = new FormControl('' , [Validators.required, Validators.email])
    this.passwordSignUpFormControl = new FormControl('' , [Validators.required, Validators.pattern(/[0-9a-zA-Z]{6,}/)])
    this.goalFormControl = new FormControl('' , [Validators.required, Validators.pattern('^[+]?([0-9]+(?:[\\.][0-9]*)?|\\.[0-9]+)$')])
    this.firstWeightFormControl = new FormControl('' , [Validators.required, Validators.pattern('^[+]?([0-9]+(?:[\\.][0-9]*)?|\\.[0-9]+)$')])

    this.emailSignUp = this.formBuilder.group({
      emailSignUpFormControl: this.emailSignUpFormControl
      });

    this.passwordSignUp = this.formBuilder.group({
      passwordSignUpFormControl: this.passwordSignUpFormControl
    });

    this.detailsSignUp = this.formBuilder.group({
      goalFormControl: this.goalFormControl,
      firstWeightFormControl: this.firstWeightFormControl
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

  signUp(){
    let emailSignUp = this.emailSignUp.get('emailSignUpFormControl').value;
    let passwordSignUp = this.passwordSignUp.get('passwordSignUpFormControl').value;
    let goal = this.detailsSignUp.get('goalFormControl').value;
    let weight = this.detailsSignUp.get('firstWeightFormControl').value;

    let firstMeasure: Measure = new Measure(weight, this.weightService.transformDateToString(new Date()));

    this.authService.createNewUser(emailSignUp, passwordSignUp, goal).then(
      () => {
        this.weightService.addMeasure(firstMeasure);
        this.router.navigate(['/mon-suivi']);
      },
      (error) => {
        console.log(error)
        this.errorMessageSignUp = this.authService.translateError(error);
      }
    )
  }

}
