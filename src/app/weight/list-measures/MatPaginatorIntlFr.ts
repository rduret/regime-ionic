import { MatPaginatorIntl } from '@angular/material/paginator';
import { Injectable } from "@angular/core";
@Injectable()
export class MatPaginatorIntlFr extends MatPaginatorIntl {
  itemsPerPageLabel = 'Pesées par page :';
  nextPageLabel     = 'Page suivante';
  previousPageLabel = 'Page précédente';
  firstPageLabel    = 'Première page';
  lastPageLabel     = 'Dernière page';
  
  getRangeLabel = function (page, pageSize, length) {
    if (length === 0 || pageSize === 0) {
      return '0 sur ' + length;
    }
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    // If the start index exceeds the list length, do not try and fix the end index to the end.
    const endIndex = startIndex < length ?
      Math.min(startIndex + pageSize, length) :
      startIndex + pageSize;
    return startIndex + 1 + ' - ' + endIndex + ' sur ' + length;
  };

}