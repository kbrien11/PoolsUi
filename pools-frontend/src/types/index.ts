export interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
  }
  
  export interface AuthResponse {
    token: string;
    user: User;
  }
  
  export interface Pool {
    id: number;
    name: string;
    code: number;
    type: string;
    box_price: string;
  }
  
  export interface Box {
    id: number;
    pair: string;
    board_number: number;
    user_pk: number | null;
    username: string;
    first_name: string;
    balance: string;
    hit: boolean;
    count: number;
  }
  
  export interface PoolStatus {
    total_boxes: number;
    claimed_boxes: number;
    remaining_boxes: number;
    game_in_progress: boolean;
    is_full: boolean;
  }