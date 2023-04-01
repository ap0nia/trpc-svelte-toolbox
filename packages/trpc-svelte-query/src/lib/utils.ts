export type Override<Left, Right> = Omit<Left, keyof Right> & Right
