export const APP_NAME = process.env.APP_NAME || 'Master Carnes';
export const APP_URL = process.env.APP_URL || 'http://localhost:3000';
export const APP_DESCRIPTION =
	process.env.APP_DESCRIPTION ||
	'Distribuidor de carnes de occidente, el privilegio de..';
export const APP_SLOGAN = process.env.APP_SLOGAN || 'Come mas, gasta menos';

export const PAGE_SIZE = Number(process.env.PAGE_SIZE || 9);

export const FREE_SHIPPING_MIN_PRICE = Number(
	process.env.FREE_SHIPPING_MIN_PRICE || 35
);
