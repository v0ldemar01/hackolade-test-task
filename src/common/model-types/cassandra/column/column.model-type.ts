interface ICassandraColumn {
  keyspaceName: string;
  tableName: string;
  columnName: string;
  kind: string;
  type: string;
}

export { type ICassandraColumn };