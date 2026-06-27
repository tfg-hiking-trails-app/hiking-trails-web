export interface Location {
  code: string;
  country?: string;
  countryCode?: string;
  state?: string;
  stateCode?: string;
  county?: string;
  countyCode?: string;
  city?: string;
  postCode?: string;
  district?: string;
  suburb?: string;
  street?: string;
  houseNumber?: number;
  formattedAddress?: string;
  addressLine1?: string;
  addressLine2?: string;
  category?: string;
  resultType?: string;
}
