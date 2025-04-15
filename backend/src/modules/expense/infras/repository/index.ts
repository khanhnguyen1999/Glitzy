import { IExpenseCommandRepository, IExpenseQueryRepository, IExpenseRepository } from '@modules/expense/interface';
import { Balance, Expense, ExpenseCategory, ExpenseDTO, ExpenseSplit } from '@modules/expense/model';
import { PagingDTO } from '@shared/model';
import { v4 as uuidv4 } from 'uuid';
import prisma from "@shared/components/prisma";
import { expense_category } from '@prisma/client';

export class PrismaExpenseQueryRepository implements IExpenseQueryRepository {

  async findById(expenseId: string): Promise<Expense | null> {
    const expense = await prisma.expenses.findUnique({
      where: { id: expenseId },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        paidBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        group: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        splitWith: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          }
        }
      }
    }) as any;

    if (!expense) return null;

    return {
      id: expense.id,
      title: expense.title,
      amount: Number(expense.amount),
      paidById: expense.paidById,
      paidByInfo: (expense as any).paidBy ? {
        id: (expense as any).paidBy.id,
        firstName: (expense as any).paidBy.firstName,
        lastName: (expense as any).paidBy.lastName,
        avatar: (expense as any).paidBy.avatar || undefined
      } : undefined,
      splitWith: (expense as any).splitWith.map((split: any) => ({
        userId: split.userId,
        amount: Number(split.amount),
        userInfo: split.user ? {
          id: split.user.id,
          firstName: split.user.firstName,
          lastName: split.user.lastName,
          avatar: split.user.avatar || undefined
        } : undefined
      })),
      groupId: expense.groupId || undefined,
      groupInfo: (expense as any).group ? {
        id: (expense as any).group.id,
        name: (expense as any).group.name,
        image: (expense as any).group.image || undefined
      } : undefined,
      category: mapCategoryToModel(expense.category),
      date: expense.date,
      notes: expense.description || undefined,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt
    };
  }

  async findByGroupId(groupId: string, paging: PagingDTO): Promise<{ data: Expense[], pagination: any }> {
    const { page, limit } = paging;
    const skip = (page - 1) * limit;

    const [expenses, total] = await Promise.all([
      prisma.expenses.findMany({
        where: { groupId },
        include: {
          paidBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true
            }
          },
          group: {
            select: {
              id: true,
              name: true,
              image: true
            }
          },
          splitWith: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: true
                }
              }
            }
          }
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit
      }),
      prisma.expenses.count({ where: { groupId } })
    ]);

    const formattedExpenses = expenses.map(expense => ({
      id: expense.id,
      title: expense.title,
      amount: Number(expense.amount),
      paidById: expense.paidById,
      paidByInfo: (expense as any).paidBy ? {
        id: (expense as any).paidBy.id,
        firstName: (expense as any).paidBy.firstName,
        lastName: (expense as any).paidBy.lastName,
        avatar: (expense as any).paidBy.avatar || undefined
      } : undefined,
      splitWith: (expense as any).splitWith.map((split: any) => ({
        userId: split.userId,
        amount: Number(split.amount),
        userInfo: split.user ? {
          id: split.user.id,
          firstName: split.user.firstName,
          lastName: split.user.lastName,
          avatar: split.user.avatar || undefined
        } : undefined
      })),
      groupId: expense.groupId || undefined,
      groupInfo: (expense as any).group ? {
        id: (expense as any).group.id,
        name: (expense as any).group.name,
        image: (expense as any).group.image || undefined
      } : undefined,
      category: mapCategoryToModel(expense.category),
      date: expense.date,
      notes: expense.description || undefined,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt
    }));

    const pages = Math.ceil(total / limit);

    return {
      data: formattedExpenses,
      pagination: {
        total,
        page,
        limit,
        pages
      }
    };
  }

  async findByUserId(userId: string, paging: PagingDTO): Promise<{ data: Expense[], pagination: any }> {
    const { page, limit } = paging;
    const skip = (page - 1) * limit;

    // Find expenses where the user is either the payer or included in the split
    const [expenses, total] = await Promise.all([
      prisma.expenses.findMany({
        where: {
          OR: [
            { paidById: userId },
            { splitWith: { some: { userId } } }
          ]
        },
        include: {
          paidBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true
            }
          },
          group: {
            select: {
              id: true,
              name: true,
              image: true
            }
          },
          splitWith: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: true
                }
              }
            }
          }
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit
      }),
      prisma.expenses.count({
        where: {
          OR: [
            { paidById: userId },
            { splitWith: { some: { userId } } }
          ]
        }
      })
    ]);

    const formattedExpenses = expenses.map(expense => ({
      id: expense.id,
      title: expense.title,
      amount: Number(expense.amount),
      paidById: expense.paidById,
      paidByInfo: (expense as any).paidBy ? {
        id: (expense as any).paidBy.id,
        firstName: (expense as any).paidBy.firstName,
        lastName: (expense as any).paidBy.lastName,
        avatar: (expense as any).paidBy.avatar || undefined
      } : undefined,
      splitWith: (expense as any).splitWith.map((split: any) => ({
        userId: split.userId,
        amount: Number(split.amount),
        userInfo: split.user ? {
          id: split.user.id,
          firstName: split.user.firstName,
          lastName: split.user.lastName,
          avatar: split.user.avatar || undefined
        } : undefined
      })),
      groupId: expense.groupId || undefined,
      groupInfo: (expense as any).group ? {
        id: (expense as any).group.id,
        name: (expense as any).group.name,
        image: (expense as any).group.image || undefined
      } : undefined,
      category: mapCategoryToModel(expense.category),
      date: expense.date,
      notes: expense.description || undefined,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt
    }));

    const pages = Math.ceil(total / limit);

    return {
      data: formattedExpenses,
      pagination: {
        total,
        page,
        limit,
        pages
      }
    };
  }

  async getGroupBalances(groupId: string): Promise<Balance[]> {
    // Get all expenses for the group
    const expenses = await prisma.expenses.findMany({
      where: { groupId },
      include: {
        paidBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        splitWith: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    // Get all group members
    const groupMembers = await prisma.groupMembers.findMany({
      where: { groupId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // Calculate balances
    const balances = new Map<string, { userId: string; userName: string; balance: number; currency: string; }>();

    // Initialize balances for all group members
    groupMembers.forEach(member => {
      if (member.user) {
        balances.set(member.userId, {
          userId: member.userId,
          userName: `${member.user.firstName} ${member.user.lastName}`,
          balance: 0,
          currency: 'USD' // Default currency, could be fetched from user preferences
        });
      }
    });

    // Calculate balances based on expenses
    expenses.forEach(expense => {
      // The person who paid gets credit
      const payer = balances.get(expense.paidById);
      if (payer) {
        payer.balance += Number(expense.amount);
      }

      // People who are part of the split get debited
      expense.splitWith.forEach(split => {
        const debtor = balances.get(split.userId);
        if (debtor) {
          debtor.balance -= Number(split.amount);
        }
      });
    });

    return Array.from(balances.values());
  }
}

export class PrismaExpenseCommandRepository implements IExpenseCommandRepository {
  async create(expenseData: ExpenseDTO): Promise<Expense> {
    const { splitWith, ...expenseInfo } = expenseData;

    // Create the expense and its splits in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the expense
      const expense = await tx.expenses.create({
        data: {
          id: expenseData.id || uuidv4(),
          title: expenseInfo.title,
          amount: expenseInfo.amount,
          paidById: expenseInfo.paidById,
          creatorId: expenseInfo.paidById, // Set creator to the same as payer if not specified
          groupId: expenseInfo.groupId,
          category: mapExpenseCategory(expenseInfo.category),
          date: expenseInfo.date || new Date(),
          description: expenseInfo.notes
        },
        include: {
          paidBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true
            }
          },
          group: expenseInfo.groupId ? {
            select: {
              id: true,
              name: true,
              image: true
            }
          } : false
        }
      });

      // Create the splits
      const splits = await Promise.all(
        splitWith.map(split =>
          tx.expenseSplits.create({
            data: {
              id: uuidv4(),
              expenseId: expense.id,
              userId: split.userId,
              amount: split.amount
            },
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: true
                }
              }
            }
          })
        )
      );

      return {
        expense,
        splitWith: splits
      };
    });

    // Format the response
    return {
      id: result.expense.id,
      title: result.expense.title,
      amount: Number(result.expense.amount),
      paidById: result.expense.paidById,
      paidByInfo: result.expense.paidBy ? {
        id: result.expense.paidBy.id,
        firstName: result.expense.paidBy.firstName,
        lastName: result.expense.paidBy.lastName,
        avatar: result.expense.paidBy.avatar || undefined
      } : undefined,
      splitWith: result.splitWith.map(split => ({
        userId: split.userId,
        amount: Number(split.amount),
        userInfo: split.user ? {
          id: split.user.id,
          firstName: split.user.firstName,
          lastName: split.user.lastName,
          avatar: split.user.avatar || undefined
        } : undefined
      })),
      groupId: result.expense.groupId || undefined,
      groupInfo: result.expense.group ? {
        id: result.expense.group.id,
        name: result.expense.group.name,
        image: result.expense.group.image || undefined
      } : undefined,
      category: mapCategoryToModel(result.expense.category),
      date: result.expense.date,
      notes: result.expense.description || undefined,
      createdAt: result.expense.createdAt,
      updatedAt: result.expense.updatedAt
    };
  }

  async update(expenseId: string, expenseData: Partial<ExpenseDTO>): Promise<Expense> {
    const { splitWith, ...expenseInfo } = expenseData;

    // Update the expense and its splits in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update the expense
      const expense = await tx.expenses.update({
        where: { id: expenseId },
        data: {
          ...(expenseInfo.title && { title: expenseInfo.title }),
          ...(expenseInfo.amount && { amount: expenseInfo.amount }),
          ...(expenseInfo.paidById && { paidById: expenseInfo.paidById }),
          ...(expenseInfo.groupId && { groupId: expenseInfo.groupId }),
          ...(expenseInfo.category && { category: mapExpenseCategory(expenseInfo.category) }),
          ...(expenseInfo.date && { date: expenseInfo.date }),
          ...(expenseInfo.notes !== undefined && { description: expenseInfo.notes })
        },
        include: {
          paidBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true
            }
          },
          group: {
            select: {
              id: true,
              name: true,
              image: true
            }
          }
        }
      });

      let splits = [];
      
      // If splits are provided, update them
      if (splitWith && splitWith.length > 0) {
        // Delete existing splits
        await tx.expenseSplits.deleteMany({
          where: { expenseId }
        });

        // Create new splits
        splits = await Promise.all(
          splitWith.map(split =>
            tx.expenseSplits.create({
              data: {
                id: uuidv4(),
                expenseId: expense.id,
                userId: split.userId,
                amount: split.amount
              },
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatar: true
                  }
                }
              }
            })
          )
        );
      } else {
        // Fetch existing splits if not updating them
        splits = await tx.expenseSplits.findMany({
          where: { expenseId },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          }
        });
      }

      return {
        expense,
        splitWith: splits
      };
    });

    // Format the response
    return {
      id: result.expense.id,
      title: result.expense.title,
      amount: Number(result.expense.amount),
      paidById: result.expense.paidById,
      paidByInfo: result.expense.paidBy ? {
        id: result.expense.paidBy.id,
        firstName: result.expense.paidBy.firstName,
        lastName: result.expense.paidBy.lastName,
        avatar: result.expense.paidBy.avatar || undefined
      } : undefined,
      splitWith: result.splitWith.map(split => ({
        userId: split.userId,
        amount: Number(split.amount),
        userInfo: split.user ? {
          id: split.user.id,
          firstName: split.user.firstName,
          lastName: split.user.lastName,
          avatar: split.user.avatar || undefined
        } : undefined
      })),
      groupId: result.expense.groupId || undefined,
      groupInfo: result.expense.group ? {
        id: result.expense.group.id,
        name: result.expense.group.name,
        image: result.expense.group.image || undefined
      } : undefined,
      category: mapCategoryToModel(result.expense.category),
      date: result.expense.date,
      notes: result.expense.description || undefined,
      createdAt: result.expense.createdAt,
      updatedAt: result.expense.updatedAt
    };
  }

  async delete(expenseId: string): Promise<boolean> {
    // Delete the expense and its splits in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete splits first (due to foreign key constraints)
      await tx.expenseSplits.deleteMany({
        where: { expenseId }
      });

      // Delete the expense
      await tx.expenses.delete({
        where: { id: expenseId }
      });
    });

    return true;
  }
}

// Helper function to map our model's expense category to Prisma's enum
function mapExpenseCategory(category: ExpenseCategory): expense_category {
  // Map from our model's categories to Prisma's categories
  switch(category) {
    case 'food':
      return 'food';
    case 'transportation':
      return 'transportation';
    case 'housing':
    case 'utilities':
      return 'accommodation';
    case 'entertainment':
      return 'activities';
    case 'shopping':
      return 'shopping';
    case 'travel':
      return 'transportation';
    case 'health':
    case 'education':
    case 'other':
    default:
      return 'other';
  }
}

// Helper function to map Prisma's enum to our model's expense category
function mapCategoryToModel(category: expense_category): ExpenseCategory {
  // Map from Prisma's categories to our model's categories
  switch(category) {
    case 'food':
      return 'food';
    case 'transportation':
      return 'transportation';
    case 'accommodation':
      return 'housing';
    case 'activities':
      return 'entertainment';
    case 'shopping':
      return 'shopping';
    default:
      return 'other';
  }
}

export class PrismaExpenseRepository implements IExpenseRepository {
  private queryRepository: IExpenseQueryRepository;
  private commandRepository: IExpenseCommandRepository;

  constructor(queryRepository: IExpenseQueryRepository, commandRepository: IExpenseCommandRepository) {
    this.queryRepository = queryRepository;
    this.commandRepository = commandRepository;
  }

  // Query methods
  async findById(expenseId: string): Promise<Expense | null> {
    return this.queryRepository.findById(expenseId);
  }

  async findByGroupId(groupId: string, paging: PagingDTO): Promise<{ data: Expense[], pagination: any }> {
    return this.queryRepository.findByGroupId(groupId, paging);
  }

  async findByUserId(userId: string, paging: PagingDTO): Promise<{ data: Expense[], pagination: any }> {
    return this.queryRepository.findByUserId(userId, paging);
  }

  async getGroupBalances(groupId: string): Promise<Balance[]> {
    return this.queryRepository.getGroupBalances(groupId);
  }

  // Command methods
  async create(expenseData: ExpenseDTO): Promise<Expense> {
    return this.commandRepository.create(expenseData);
  }

  async update(expenseId: string, expenseData: Partial<ExpenseDTO>): Promise<Expense> {
    return this.commandRepository.update(expenseId, expenseData);
  }

  async delete(expenseId: string): Promise<boolean> {
    return this.commandRepository.delete(expenseId);
  }
}