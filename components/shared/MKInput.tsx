'use client'
import React, { HTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

import { FieldValues, UseFormRegister, FieldPath } from 'react-hook-form';

// interface Props<T extends FieldValues> extends HTMLAttributes<HTMLInputElement> {
//   parentAttrs?: HTMLAttributes<HTMLDivElement>
//   field: FieldPath<T>
//   register: UseFormRegister<T>
// }



export interface InputProps <T extends FieldValues> extends HTMLAttributes<HTMLInputElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
  field: FieldPath<T>;
  register: UseFormRegister<T>;
  placeholder?: string;
  classNames?: string;
  label?: string;
}

export const MKInput =  <T extends FieldValues>(props: InputProps<T>) => {

    const {  
      register,
      field,
      classNames,
      variant = 'primary',
      disabled,
      isLoading = false,
      leftIcon,
      rightIcon,
      label,
     } = props

    const baseStyles = "border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground h-10 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";
    
    const variants = {
      primary: 'border-input bg-transparent text-foreground placeholder:text-muted-foreground hover:border-primary focus:border-primary focus:ring-primary focus:outline-none focus:ring-opacity-40 disabled:cursor-not-allowed disabled:opacity-50',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
      outline: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
      ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    };

    // const sizes = {
    //   sm: 'w-40 text-sm px-3 py-1.5',
    //   md: 'text-base px-4 py-2',
    //   lg: 'text-lg px-6 py-3',
    // };

    return (
      <div>
        {label && <p>{label}</p>}
        <div className="flex w-full">
          {!isLoading && leftIcon && (
            <span className="ml-2">{leftIcon}</span>
          )}
          <input
            type="text"
            placeholder={props.placeholder}
            {...register(field)}
            className={
              cn(
                baseStyles,
                variants[variant],
                classNames
              )}
            disabled={disabled || isLoading}
            {...props}
          />
          {isLoading && (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
          {!isLoading && rightIcon && (
            <span className="ml-2">{rightIcon}</span>
          )}
        </div>  
      </div>
    )
  }
