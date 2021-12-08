import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([])
  const [stocks, setStocks] = useState<Stock[]>([])

  const addProduct = async (productId: number) => {
    const product = products.find(product => product.id === productId)
    const cartProduct = cart.find(product => product.id === productId)
    const productStock = stocks.find(product => product.id === productId)

    try {
      // TODO

      if (cartProduct) {

        updateProductAmount({ productId, amount: cartProduct.amount + 1 })

      } else if (product && productStock && productStock.amount) {
        const newCart = [
          ...cart,
          {
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.image,
            amount: 1
          }
        ]

        setCart(newCart)

        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart))
      }
    } catch {
      // TODO
      toast.error('Erro na adição do produto')
    }
  };

  const removeProduct = (productId: number) => {
    const newCart = cart.filter(product => product.id !== productId)

    try {
      // TODO
      setCart(newCart)
    } catch {
      // TODO
      toast.error('Erro na remoção do produto')
    } finally {
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart))
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    const productStock = stocks.find(product => product.id === productId)

    if (productStock && (amount > productStock.amount || amount < 1)) {
      toast.error('Quantidade solicitada fora de estoque')
      return
    }

    const newCart = cart.map(product => {
      if (product.id === productId) {
        return {
          id: product.id,
          title: product.title,
          price: product.price,
          image: product.image,
          amount
        }
      }

      return product
    })

    try {
      // TODO

      setCart(newCart)

    } catch {
      // TODO
      toast.error('Erro na alteração de quantidade do produto')
    } finally {
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart))
    }
  };

  async function updateCart() {
    const storagedCart = localStorage.getItem('@RocketShoes:cart')

    if (storagedCart) {
      setCart(JSON.parse(storagedCart))
    }
  }

  async function updateProducts() {
    const products = await api.get<Product[]>('/products')

    setProducts(products.data)
  }

  async function updateStocks() {
    const stocks = await api.get<Stock[]>('/stock')

    setStocks(stocks.data)
  }

  useEffect(() => {
    updateCart()
    updateProducts()
    updateStocks()
  }, [])

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
