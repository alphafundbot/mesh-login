interface Transaction {
  type: 'deposit' | 'withdraw';
  amount: number;
  source?: string;
  reason?: string;
  timestamp: Date;
}

class WalletCore {
  private balance: number = 0;
  private ledger: Transaction[] = [];

  deposit(amount: number, source: string): void {
    if (amount > 0) {
      this.balance += amount;
      const transaction: Transaction = {
        type: 'deposit',
        amount,
        source,
        timestamp: new Date(),
      };
      this.ledger.push(transaction);
    }
  }

  withdraw(amount: number, reason: string): boolean {
    if (amount > 0 && this.balance >= amount) {
      this.balance -= amount;
      const transaction: Transaction = {
        type: 'withdraw',
        amount,
        reason,
        timestamp: new Date(),
      };
      this.ledger.push(transaction);
      return true;
    }
    return false; // Indicate insufficient funds or invalid amount
  }

  getBalance(): number {
    return this.balance;
  }

  getLedger(): Transaction[] {
    return this.ledger;
  }
}