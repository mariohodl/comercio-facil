'use client'
import React, { useState, useEffect, useTransition } from 'react'
import { v4 as uuidv4 } from 'uuid';
// import Product from '@/lib/db/models/product.model';
import { MKInput } from '@/components/shared/MKInput'
import { MKButton } from '@/components/shared/MKButton'
import { useForm, SubmitHandler } from 'react-hook-form'
import { MKTextarea } from '@/components/shared/MKTextarea'
import { AVAILABLE_CATEGORIES } from '@/lib/constants'
import { createOrderReception } from '@/lib/actions/orderReception.actions'
import { getAllProveedoresForAdmin } from '@/lib/actions/proveedor.actions'
import { getAllExistingProducts } from '@/lib/actions/product.actions'
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { calculateTotalPriceOfProducts } from '@/lib/utils'
import { TAX_RATE } from '@/lib/constants'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { IProduct } from '@/lib/db/models/product.model'

type ProductPreAddedType = {
  name: string
  productId: number
  countInStock: number
  listPrice: number
  category: string
  isProductKg: boolean
}

type FormFields = {
  nameProvider: string
  clave: string
  facturaNumber: string
  rfc: string
  observations?: string
  isPaid?: boolean
  subtotal?: number
  total?: number
  iva?: number
  productToAddName: string
  productToAddCategory: string
  productToAddProductId: number
  productToAddQuantity: number
  productToAddPrice: number
  productToAddIsProductKg: boolean
}

// const pdpExample = {    name: 'Arrachera sirlon de angus',
//   productId: 2,
//   quantity: 240,
//   price: 155,
//   category: 'Res',
//   isProductKg: true}

const OrderReceptionDetails = () => {
    const { showSuccess, showError} = useToast()
    const router = useRouter()
    const [proveedoresData, setProveedoresData] = useState([])
    const [productsData, setProductsData] = useState([])
    const [productsPreAdded, setProductsPreAdded] = useState<Array<ProductPreAddedType>>([])

    const [filteredProveedoresData, setFilteredProveedoresData] = useState([])
    const [filteredProductsData, setFilteredProductsData] = useState([])

    const [isPending, startTransition] = useTransition()
    const [autosuggestProveedoresSelected, setAutosuggestProveedoresSelected] = useState()
    const [idBasedOnSavedProducts, setIdBasedOnSavedProducts] = useState(0)
    const [autosuggestProductSelected, setAutosuggestProductSelected] = useState()

  const { register, handleSubmit, watch , setValue} = useForm<FormFields>({
    defaultValues: {
      nameProvider: '',
      clave: uuidv4().toString().substring(0, 8),
      facturaNumber: '',
      rfc: '',
      observations: '',
      isPaid: false,
      subtotal: 0,
      total: 0,
      iva: 0,
      productToAddName: '',
      productToAddCategory: '',
      productToAddProductId: 0,
      productToAddQuantity: 0,
      productToAddPrice: 0,
      productToAddIsProductKg: true

    },
  })

  const nameProviderWatcher = watch('nameProvider')
  const RFCWatcher = watch('rfc')
  const facturaWatcher = watch('facturaNumber')

  const productToAddNameWatcher = watch('productToAddName');
  const productToAddProductIdWatcher = watch('productToAddProductId');
  const productToAddCategoryWatcher = watch('productToAddCategory');
  const productToAddPriceWatcher = watch('productToAddPrice');
  const productToAddQuantityWatcher = watch('productToAddQuantity');
  const productToAddIsProductKgWatcher = watch('productToAddIsProductKg');

  const totalAmount  = calculateTotalPriceOfProducts(productsPreAdded, true, true);
  const subTotalAmount = calculateTotalPriceOfProducts(productsPreAdded, false, true);


  useEffect(() => {
    console.log('nameProviderWatcher', nameProviderWatcher)
    console.log('proveedoresData', proveedoresData)
    // if(nameProviderWatcher?.length < 3) {
    //   setFilteredProveedoresData([])
    //   setAutoCompleteReady(true)
    //   setAutosuggestProveedoresSelected(undefined)
    //   setValue('nameProvider', '')
    //   setValue('clave', '')
    //   setValue('rfc', '')
    //   setValue('facturaNumber', '')
    //   return  
    // }
    if (nameProviderWatcher?.length > 2 && proveedoresData?.length > 0) {
      const results = proveedoresData?.filter((item: any) => {
        return item?.nameProvider?.toLowerCase().includes(nameProviderWatcher?.toLowerCase())
      })
      if (results.length > 0) {
        //assign results to the autoCompleteData
        setTimeout(() => {
          setFilteredProveedoresData(results)
        }
        , 500)
      } else {
        setFilteredProveedoresData([])
      }
    } else {
      setFilteredProveedoresData([])
    }
  }, [nameProviderWatcher, proveedoresData])

  useEffect(() => {

    if (productToAddNameWatcher?.length > 2 && productsData?.length > 0) {
      console.log(productToAddNameWatcher)
      const results = productsData?.filter((item: any) => {
        return item?.name?.toLowerCase().includes(productToAddNameWatcher?.toLowerCase())
      })
      console.log(results)
      if (results.length > 0) {
        //assign results to the autoCompleteData

        setTimeout(() => {
          setFilteredProductsData(results)
        }
        , 500)
      } else {
        setFilteredProductsData([])
      }
    } else {
      setFilteredProductsData([])
    }
  }, [productToAddNameWatcher, productsData])


  const onSubmit: SubmitHandler<FormFields> = (data) => {
    let isAtLeastOneError = false
    if(nameProviderWatcher.length < 3){
      showError('Ingresa un nombre de proveedor válido!')
      isAtLeastOneError = true
    }

    if(RFCWatcher.length < 8){
      showError('Ingresa un RFC válido!')
      isAtLeastOneError = true
    }

    if(facturaWatcher.length < 4){
      showError('Ingresa un Número de factura válido!')
      isAtLeastOneError = true
    }

    if(isAtLeastOneError){
      return
    }

    // validations about the total and subtotal amount are needed here and in the backend before saaving to DB
    const orderReceptionData = {
      ...data,
      subtotal: Number(calculateTotalPriceOfProducts(productsPreAdded, false, false)),
      total: Number(calculateTotalPriceOfProducts(productsPreAdded, true, false)),
      iva: TAX_RATE,
      products: productsPreAdded,
    }
    createOrderReception(orderReceptionData)
      .then((res) => {
        console.log('res', res)
        if (res?.success) {
          showSuccess('Recepcion de compra creada correctamente')
          setTimeout(() => {
            router.push('/admin/ordenes-de-compra')
          }, 500)
        } else {
          showError('Error al crear Recepcion de compra')
        }
      })
      .catch((err) => { 
        showError('Error al crear Recepcion de compra')
        console.log('err', err)
      })

  }

    useEffect(() => {
      startTransition(async () => {
        const data = await getAllProveedoresForAdmin({ query: '' })
        setProveedoresData(data?.proveedores)
      })
    }, [])

    useEffect(() => {
      startTransition(async () => {
        const data = await getAllExistingProducts()
        const idResult = getHighetsProductId(data.products)
        setIdBasedOnSavedProducts(idResult);
        const idSuggested = idResult + 1;
        setValue('productToAddProductId', idSuggested)
        console.log('PRODUCTOS',data.products)
        setProductsData(data?.products) 
      })
    }, [])

    useEffect(()=>{
      if(idBasedOnSavedProducts){
        const idSuggested = idBasedOnSavedProducts + (productsPreAdded.length + 1);
        setValue('productToAddProductId', idSuggested)
      }
      console.log('se renderiza una ves')
    },[productsPreAdded])

  const handleAutoCompleteProveedorSelected = (item: any) => {
    setAutosuggestProveedoresSelected(item)
    setFilteredProveedoresData([])
    setValue('nameProvider', item?.nameProvider)
    setValue('clave', item?.clave)
    setValue('rfc', item?.rfc)
    setValue('facturaNumber', item?.facturaNumber)
  }

  const handleAutoCompleteProductSelected = (item: any) => {
    setAutosuggestProductSelected(item)
    setFilteredProductsData([])

    setValue('productToAddName', item?.name)
    setValue('productToAddCategory', item?.category)
    setValue('productToAddIsProductKg', item.isProdctKg)
    setValue('productToAddProductId', item.productId) 

  }

  const handleOnAddProduct = () => {
    let isAtLeastOneError = false;
    const productToAddPriceWatcherDDD = Number(productToAddPriceWatcher)
    const productToAddQuantityWatcherDDD = Number(productToAddQuantityWatcher)

    if(productToAddNameWatcher.length < 5){
      showError('Ingresa un nombre de producto válido!')
      isAtLeastOneError = true
    }

    if(productToAddCategoryWatcher.length === 0){
      showError('Selecciona una categoría de producto!')
      isAtLeastOneError = true
    }

    if(productToAddPriceWatcherDDD <= 0 || typeof(productToAddPriceWatcherDDD) !== 'number'){
      showError('Precio debe ser un valor numérico válido!')
      isAtLeastOneError = true
    }

    if(productToAddQuantityWatcherDDD <= 0 || typeof(productToAddQuantityWatcherDDD) !== 'number'){
      showError('Cantidad debe ser un valor numérico válido!')
      isAtLeastOneError = true
    }

    console.log(productToAddPriceWatcherDDD)
    console.log(productToAddQuantityWatcherDDD)
    if(isAtLeastOneError){
      return
    }

    const baseProduct = {
      name: productToAddNameWatcher,
      productId: productToAddProductIdWatcher,
      category: productToAddCategoryWatcher,
      price: productToAddPriceWatcherDDD, //adding the same price, if we need to compute here an incremented price, we'll do it later
      listPrice: productToAddPriceWatcherDDD,
      discountPrice: 0,
      countInStock: productToAddQuantityWatcherDDD,
      isProductKg: !!productToAddIsProductKgWatcher ? productToAddIsProductKgWatcher : false,
      slug: '',
      images: [],
      tags: ['new-arrival'],
      isPublished: false,
      brand: '',
      avgRating: 0,
      numReviews: 0,
      ratingDistribution: [
        { rating: 1, count: 0 },
        { rating: 2, count: 0 },
        { rating: 3, count: 0 },
        { rating: 4, count: 0 },
        { rating: 5, count: 0 },
      ],
      numSales: 0,
      description:'',
      reviews: [],
    }
    setProductsPreAdded([...productsPreAdded, baseProduct])

    setValue('productToAddName', '')
    setValue('productToAddCategory', '')
    setValue('productToAddPrice', 0)
    setValue('productToAddQuantity', 0)
    setValue('productToAddIsProductKg', true)

    setAutosuggestProductSelected(undefined)
    setFilteredProductsData([])

    // setValue('productToAddProductId', 435643) //agregar el numero consiguente dada la suma de pdps registratos y agregados en array
  }

  const getHighetsProductId = (arr: IProduct[]) =>{
    if (!arr || arr.length === 0) return 0

    const isFound = Math.max(...arr.map(o => o.productId))
    return isFound
  }

  return (
    <form className='w-full' onSubmit={handleSubmit(onSubmit)}>

      <div className='flex'>
        <div className='m-3 w-1/2'>
          <MKInput
            label="Nombre del proveedor"
            field='nameProvider'
            register={register}
            placeholder="Ingresa el nombre del proveedor"
            autoCompleteData={filteredProveedoresData}
            showAutoComplete={autosuggestProveedoresSelected}
            onAutoCompleteSelected={handleAutoCompleteProveedorSelected}
          />
        </div>

        <div className='m-3 w-1/3'>
          <MKInput
            label="Clave del proveedor"
            field='clave'
            disabled={true}
            register={register}
            placeholder="Ingresa la clave del proveedor"
          />
        </div>


        <div className='m-3 w-1/3'>
          <MKInput
            label="RFC del proveedor"
            field='rfc'
            register={register}
            disabled={autosuggestProveedoresSelected}
            placeholder="Ingresa el rfc del proveedor"
          />
        </div>
      </div>

      <div className='flex'>
        <div className='m-3 w-1/3'>
          <MKInput
            label="Número de factura"
            field='facturaNumber'
            register={register}
            placeholder="Ingresa el numero de factura"
          />
        </div>

        <div className='m-3 w-full'>
          <MKTextarea
            label="Observaciones"
            field='observations'
            register={register}
            placeholder="Observaciones generales"
          />
        </div>
      </div>

      <div className='mt-10'>
        <h3 className='text-2xl font-bold text-center'>Ingresar Productos</h3>
      </div>
      
      <div className='flex flex-col'>
          <div  className='border-2 border-gray-300 rounded-md py-2 m-3 relative'>
            <div className='flex items-center mx-3'>
            {/* <ItemValueDisplay index={index} control={control} /> */}
              <div className='m-3 w-1/2'>
                <MKInput
                  label="Nombre del producto"
                  field={`productToAddName`}
                  register={register}
                  placeholder="Ingresa el nombre del producto"
                  autoCompleteData={filteredProductsData}
                  showAutoComplete={autosuggestProductSelected}
                  onAutoCompleteSelected={handleAutoCompleteProductSelected}
                />
              </div>
              <div className='m-3 w-1/4'>
                <MKInput
                  label="ID del producto"
                  field={`productToAddProductId`}
                  register={register}
                  placeholder="Id de producto"
                  disabled
                />
              </div>

              <div className='m-3 w-1/4'>
                <p>Categoria</p>
                <select
                    {...register(`productToAddCategory`)}
                    className="flex-1 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                  >
                    <option value="">Agrega categoría</option>
                    {AVAILABLE_CATEGORIES.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
              </div>
              
              <div className='m-3 w-1/5'>
                <MKInput
                  label="Precio"
                  field={`productToAddPrice`}
                  register={register}
                  placeholder="Ingresa el precio"
                  typeInput='number'

                />
              </div>
              <div className='m-3 w-1/5'>
                <MKInput
                  label="Cantidad"
                  field={`productToAddQuantity`}
                  register={register}
                  placeholder="Ingresa la cantidad"
                  typeInput='number'
                />
              </div>
              {/* {
                index > 0 && (
                  <div className='w-6 h-6 bg-primary cursor-pointer flex flex-center flex-wrap items-center rounded-full absolute right-0 top-0'>
                    <span className='ml-2 text-white' onClick={() => onRemoveProduct(index)}>x</span>
                  </div>
                )
              } */}

            </div>
            <div className='flex items-center mx-3'>
              <div className='w-full flex justify-end'>

                <div className='flex'>
                  <p className='mr-2 text-center'>¿Es producto en kg? </p>
                  <input type="checkbox" {...register(`productToAddIsProductKg`)} defaultChecked />
                </div>
              </div>
            </div>
            {
              <div className='flex justify-center'>
                <p className='underline cursor-pointer' onClick={handleOnAddProduct}>Agregar producto</p>
              </div>
            }
            
          </div>
      </div>
      {
         productsPreAdded.length > 0 && (
            <div className='my-8'>
              <h2 className='text-primary font-bold'>Productos PRE-ingresados</h2>
              <div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead className='text-center'>ID de Producto</TableHead>
                    <TableHead className='text-center'>Categoria</TableHead>
                    <TableHead className='text-center'>Precio</TableHead>
                    <TableHead className='text-center'>Cantidad</TableHead>
                    <TableHead className='text-center'>Producto en Kg?</TableHead>

                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productsPreAdded.map((product: ProductPreAddedType, index) => (
                    <TableRow key={index}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell className='text-center'>{product.productId}</TableCell>
                      <TableCell className='text-center'>{product.category}</TableCell>
                      <TableCell className='text-center'>{ product.price}</TableCell>
                      <TableCell className='text-center'>{product.countInStock}</TableCell>
                      <TableCell className='text-center'>{product.isProductKg ? 'Si' : 'No'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
          </div>
        )
      }

      <div className='flex justify-end mt-10'>
        <div>
          <p className='text-xl font-bold text-right'>Subtotal: {subTotalAmount}</p>
          <p className='text-xl font-bold text-right'>IVA: {TAX_RATE}%</p>
          <p className='text-2xl font-bold text-right'>Total: {totalAmount}</p>
        </div>
        
      </div>

      <div className='flex justify-center m-3 mt-10'>
        <MKButton>Guardar Recepción de Compra</MKButton>
      </div>
    </form>
  )
}

export default OrderReceptionDetails