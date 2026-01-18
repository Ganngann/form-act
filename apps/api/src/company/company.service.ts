import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class CompanyService {
  async validateVat(fullVatNumber: string) {
    // Remove spaces/dots/dashes
    const cleanVat = fullVatNumber.replace(/[^A-Z0-9]/gi, '').toUpperCase();

    if (cleanVat.length < 4) {
         throw new HttpException('Invalid VAT format', HttpStatus.BAD_REQUEST);
    }

    const countryCode = cleanVat.substring(0, 2);
    const vatNumber = cleanVat.substring(2);

    try {
      const response = await fetch(
        `https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${countryCode}/vat/${vatNumber}`,
      );

      if (!response.ok) {
          // If 404/400, it might mean invalid input, but 500 is VIES down
          // We can fallback or throw
          const errorText = await response.text();
          console.error('VIES Error:', response.status, errorText);
          throw new HttpException(`VIES API Error: ${response.status}`, HttpStatus.BAD_GATEWAY);
      }

      const data = await response.json();

      if (!data.isValid) {
          // It's a valid request but the VAT is not valid
          return {
              isValid: false,
              companyName: '',
              address: ''
          };
      }

      return {
          isValid: true,
          companyName: data.name,
          address: data.address,
          vatNumber: cleanVat
      };

    } catch (error) {
        console.error('VIES Exception:', error);
        if (error instanceof HttpException) throw error;
        throw new HttpException('Error connecting to VIES', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
