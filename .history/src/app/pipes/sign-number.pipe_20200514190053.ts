import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'signNumber'
})
export class SignNumberPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    return null;
  }

}
