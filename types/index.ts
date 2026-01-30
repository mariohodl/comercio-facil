import {
	CartSchema,
	OrderItemSchema,
	ProductInputSchema,
	ShippingAddressSchema,
	UserInputSchema,
	OrderInputSchema,
	UserSignInSchema,
	ReviewInputSchema,
	UserSignUpSchema,
	UserNameSchema,
	OrderReceptionSchema,
	ProveedorInputSchema,
	IReportInput,
	ReportInputSchema,
	CategoryInputSchema,
	CategoryUpdateSchema,
	SubCategoryInputSchema,
	BrandInputSchema,
	UnitInputSchema,
	AttributeInputSchema,
} from '@/lib/validator';
import { z } from 'zod';
import { ICustomer } from '@/lib/db/models/customer.model'

export type IReviewInput = z.infer<typeof ReviewInputSchema>
export type IReviewDetails = IReviewInput & {
	_id: string
	createdAt: string
	user: {
		name: string
	}
}

export type IProductInput = z.infer<typeof ProductInputSchema> & { _id?: string };

export type Data = {
	users: IUserInput[];
	products: IProductInput[];
	reviews: {
		title: string
		rating: number
		comment: string
	}[];
	customers?: ICustomer[];
	orders?: any[];
	headerMenus: {
		name: string;
		href: string;
	}[];
	carousels: {
		image: string;
		url: string;
		title: string;
		description: string;
		buttonCaption: string;
		isPublished: boolean;
	}[];
	categories: ICategoryInput[];
	subCategories: ISubCategoryInput[];
	brands: IBrandInput[];
	units: IUnitInput[];
	attributes: IAttributeInput[];
	companies: {
		name: string;
		ownerEmail: string;
		plan: string;
		planStatus: string;
		trialStartDate: Date;
		trialEndDate: Date;
		freeMonths: number;
	}[];
	stores: any[];
	warehouses: any[];
};

export type ProductImage = {
	imgUrl: string,
	imgKey: string,
	name?: string,
	size?: number,
	file?: File
}

export type IOrderList = IOrderInput & {
	_id: string
	user: {
		name: string
		email: string
	}
	customer?: {
		name: string
		email?: string
	}
	createdAt: Date
}

export type IOrderInput = z.infer<typeof OrderInputSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type Cart = z.infer<typeof CartSchema>;
export type ShippingAddress = z.infer<typeof ShippingAddressSchema>;

// user
export type IUserInput = z.infer<typeof UserInputSchema>;
export type IUserSignIn = z.infer<typeof UserSignInSchema>;
export type IUserSignUp = z.infer<typeof UserSignUpSchema>;
export type IUserName = z.infer<typeof UserNameSchema>

// order reception
export type IOrderReceptionInput = z.infer<typeof OrderReceptionSchema>;


// Proveedores
export type IProveedorInput = z.infer<typeof ProveedorInputSchema>;


//Reportes

export type IReportInput = z.infer<typeof IReportInput>;
export type IReportSchema = z.infer<typeof ReportInputSchema>

// Categories
export type ICategoryInput = z.infer<typeof CategoryInputSchema>
export type ISubCategoryInput = z.infer<typeof SubCategoryInputSchema>;
// Brands
export type IBrandInput = z.infer<typeof BrandInputSchema>;

// Units

export type IUnitInput = z.infer<typeof UnitInputSchema>;

// Attributes

export type IAttributeInput = z.infer<typeof AttributeInputSchema>;