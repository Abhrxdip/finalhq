import { Contract } from '@algorandfoundation/algorand-typescript'

export class Hacktera extends Contract {
  public hello(name: string): string {
    return `Hello, ${name}`
  }
}
