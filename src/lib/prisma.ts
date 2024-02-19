import { PrismaClient } from "@prisma/client";
import { User } from "next-auth";
import { v4 as uuidv4 } from "uuid";
import { sha256 } from "./crypto";
import config from "./config/default.config";

export class Prisma extends PrismaClient {
  constructor() {
    super();
    this.$connect();
  }

  /**
   * Get a table
   * @param table The table to get
   * @returns The table
   */
  public static readonly getTable = (table: string) => {
    const global = globalThis as any;
    return global.prisma[table];
  };

  /**
   * Finds many rows in a table
   * @param table The table to find in
   * @param opts The find options
   * @returns The rows found
   */
  public static readonly findMany = async <T>(
    table: string,
    opts: any,
  ): Promise<T[]> => {
    try {
      const tableRef: any = Prisma.getTable(table);

      return (await tableRef.findMany(opts)) as T[];
    } catch {
      return [];
    }
  };

  /**
   * Finds a row in a table
   * @param table The table to find in
   * @param opts The find options
   * @returns The row found, or null if it doesn't exist
   */
  public static readonly findOne = async <T>(
    table: string,
    opts: any,
  ): Promise<T | null> => {
    try {
      const tableRef: any = Prisma.getTable(table);

      return (await tableRef.findFirst(opts)) as T | null;
    } catch {
      return null;
    }
  };

  /**
   * Creates a row in a table
   * @param table The table to create in
   * @param opts The creation options
   * @returns The created row
   */
  public static readonly create = async <T>(
    table: string,
    opts: any,
  ): Promise<T | null> => {
    try {
      const tableRef: any = Prisma.getTable(table);

      return (await tableRef.create(opts)) as T;
    } catch {
      return null;
    }
  };

  /**
   * Updates a row in a table
   * @param table The table to update
   * @param where The where clause to update
   * @param data The data to update
   * @returns The updated row
   */
  public static readonly update = async <T>(
    table: string,
    data: any,
  ): Promise<T | null> => {
    try {
      const tableRef: any = Prisma.getTable(table);

      return (await tableRef.update(data)) as T;
    } catch {
      return null;
    }
  };

  /**
   * Deletes a row from a table
   *
   * @param table The table to delete from
   * @param opts The delete options
   * @returns The deleted row
   */
  public static readonly delete = async <T>(
    table: string,
    opts: any,
  ): Promise<T | null> => {
    try {
      const tableRef: any = Prisma.getTable(table);

      return (await tableRef.delete(opts)) as T;
    } catch {
      return null;
    }
  };

  /**
   * Get an user by their email from the database -- include password and secret
   *
   * @param email The user's email
   * @returns The user
   */
  public static readonly getUserByEmailUnsecure = async (
    email: string,
  ): Promise<User | null> => {
    return await Prisma.findOne<User>("user", {
      where: {
        email,
      },
    });
  };

  /**
   * Get an user by their email from the database
   *
   * @param email The user's email
   * @returns The user
   */
  public static readonly getUserByEmail = async (
    email: string,
  ): Promise<User | null> => {
    const user = await Prisma.findOne<User>("user", {
      where: {
        email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        permissions: true,
        password: false,
        secret: false,
      },
    });

    return user;
  };

  /**
   * Fetch whether the user exists in the database
   *
   * @param email The user's email
   * @returns If the user exists
   */
  public static readonly userExists = async (
    email: string,
  ): Promise<boolean> => {
    return (await Prisma.getUserByEmail(email)) !== null;
  };

  /**
   * Fetch the user data from the database
   *
   * @param userSecret The user's secret
   * @returns The user's data
   */
  public static readonly getUserBySecret = async (
    userSecret: string,
  ): Promise<User | null> => {
    return await Prisma.findOne<User>("user", {
      where: {
        secret: userSecret,
      },
    });
  };

  /**
   * Create a new user in the database
   *
   * @param user The user to create
   * @returns The created user or null if it failed
   */
  public static readonly createUser = async (
    user: User,
  ): Promise<User | null> => {
    const generatedPassword = await sha256(uuidv4());

    return await Prisma.create<User>("user", {
      data: {
        id: user.id,
        secret: user.secret,
        email: user.email,
        password: user.password || generatedPassword,
        name: user.name || config.user.name,
        image: user.image || config.user.image,
        permissions: user.permissions || config.user.permissions,
      },
    });
  };
}

// create a global prisma instance
const global = globalThis as any;
if (!global.prisma) {
  global.prisma = new Prisma();
}
