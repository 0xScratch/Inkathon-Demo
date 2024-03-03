
#![cfg_attr(not(feature = "std"), no_std, no_main)]
#[ink::contract]
pub mod token {
    use psp22_full::traits::PSP22Metadata;
    use psp22_full::errors::OwnableError;
    use psp22_full::traits::Ownable;
    use psp22_full::traits::PSP22Mintable;
    use ink::prelude::vec::Vec;
    use ink::prelude::string::String;
    use ink::prelude::string::ToString;
    use psp22_full::{PSP22, PSP22Data, PSP22Error, PSP22Event};


    #[ink(storage)]
    pub struct Token {
        pub data: PSP22Data,
        pub owner: Option<AccountId>,
        pub name: Option<String>,
        pub symbol: Option<String>,
        pub decimals: u8,
    }

    impl Token {
        #[ink(constructor)]
        pub fn new(supply: u128) -> Self {
            Self {
                data: PSP22Data::new(supply, Self::env().caller()),
                owner: Some(Self::env().caller()),
                name: Some("Ethereal Token".to_string()),
                symbol: Some("ETH".to_string()),
                decimals: 0u8,
            }
        }

        fn emit_events(&self, events: Vec<PSP22Event>) {
            for event in events {
                match event {
                    PSP22Event::Transfer { from, to, value } => {
                        self.env().emit_event(Transfer { from, to, value })
                    }
                    PSP22Event::Approval { owner, spender, amount } => {
                        self.env().emit_event(Approval { owner, spender, amount })
                    }
                }
            }
        }
    }

    #[ink(event)]
    pub struct Approval {
        #[ink(topic)]
        owner: AccountId,
        #[ink(topic)]
        spender: AccountId,
        amount: u128,
    }

    #[ink(event)]
    pub struct Transfer {
        #[ink(topic)]
        from: Option<AccountId>,
        #[ink(topic)]
        to: Option<AccountId>,
        value: u128,
    }

    impl PSP22 for Token {
        #[ink(message)]
        fn total_supply(&self) -> u128 {
            self.data.total_supply()
        }

        #[ink(message)]
        fn balance_of(&self, owner: AccountId) -> u128 {
            self.data.balance_of(owner)
        }

        #[ink(message)]
        fn allowance(&self, owner: AccountId, spender: AccountId) -> u128 {
            self.data.allowance(owner, spender)
        }

        #[ink(message)]
        fn transfer(
            &mut self,
            to: AccountId,
            value: u128,
            _data: Vec<u8>,
        ) -> Result<(), PSP22Error> {
            let events = self.data.transfer(self.env().caller(), to, value)?;
            self.emit_events(events);
            Ok(())
        }

        #[ink(message)]
        fn transfer_from(
            &mut self,
            from: AccountId,
            to: AccountId,
            value: u128,
            _data: Vec<u8>,
        ) -> Result<(), PSP22Error> {
            let events = self.data.transfer_from(self.env().caller(), from, to, value)?;
            self.emit_events(events);
            Ok(())
        }

        #[ink(message)]
        fn approve(
            &mut self,
            spender: AccountId,
            value: u128,
        ) -> Result<(), PSP22Error> {
            let events = self.data.approve(self.env().caller(), spender, value)?;
            self.emit_events(events);
            Ok(())
        }

        #[ink(message)]
        fn increase_allowance(
            &mut self,
            spender: AccountId,
            delta_value: u128,
        ) -> Result<(), PSP22Error> {
            let events = self
                .data
                .increase_allowance(self.env().caller(), spender, delta_value)?;
            self.emit_events(events);
            Ok(())
        }

        #[ink(message)]
        fn decrease_allowance(
            &mut self,
            spender: AccountId,
            delta_value: u128,
        ) -> Result<(), PSP22Error> {
            let events = self
                .data
                .decrease_allowance(self.env().caller(), spender, delta_value)?;
            self.emit_events(events);
            Ok(())
        }
    }

    impl PSP22Mintable for Token {
        #[ink(message)]
        fn mint(&mut self, to: AccountId, amount: u128) -> Result<(), PSP22Error> {
            let events = self.data.mint(to, amount)?;
            self.emit_events(events);
            Ok(())
        }
    }

    impl Ownable for Token {
        #[ink(message)]
        fn owner(&self) -> Option<AccountId> {
            self.owner
        }

        #[ink(message)]
        fn renounce_ownership(&mut self) -> Result<(), OwnableError> {
            assert_eq!(
                Some(self.env().caller()), self.owner,
                "Only owner can renounce ownership"
            );
            self.owner = None;
            Ok(())
        }

        #[ink(message)]
        fn transfer_ownership(
            &mut self,
            new_owner: Option<AccountId>,
        ) -> Result<(), OwnableError> {
            assert_eq!(
                Some(self.env().caller()), self.owner,
                "Only owner can transfer ownership"
            );
            self.owner = new_owner;
            Ok(())
        }
    }

    impl PSP22Metadata for Token {
        #[ink(message)]
        fn token_name(&self) -> Option<String> {
            self.name.clone()
        }

        #[ink(message)]
        fn token_symbol(&self) -> Option<String> {
            self.symbol.clone()
        }

        #[ink(message)]
        fn token_decimals(&self) -> u8 {
            self.decimals
        }
    }
}