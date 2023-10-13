import { PoolConnection } from 'mysql2';
import db from '../database/dbConnection';

export const runTransaction = async (callback: (connection: PoolConnection) => Promise<any>): Promise<any> => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const result = await callback(connection);

    await connection.commit();

    return result;

  } catch (error) {
    if (connection) {
      await connection.rollback();
      console.error('Transaction Rolledback...!')
    }
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}