import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import * as firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate{

  constructor(private router: Router){}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      return new Promise(
        (resolve, reject) => {
          firebase.auth().onAuthStateChanged(
            (user) => {
              if(user) {
                resolve(true);
              } else {
                this.router.navigate(['auth/connexion']);
                resolve(false);
              }
            }
          );
        }
      );
  }
}
