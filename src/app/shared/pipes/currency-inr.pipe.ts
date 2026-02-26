import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'currencyInr', standalone: true })
export class CurrencyInrPipe implements PipeTransform {
  transform(value: number | undefined | null): string {
    if (value === null || value === undefined) return '₹0';
    return '₹' + value.toLocaleString('en-IN');
  }
}
