import re
import os
import sys

# interesting functions (not all studied)
symbols = [
    "?BuildNewEncryptedPasswordHistory@LdapComputer@",
    "?BuildNewEncryptedPassword@LdapComputer@",
    "?BuildPasswordJson@LdapComputer@",
    "?BuildPasswordUpdateFactorsStringHelper@LapsCore@",
    "?CheckADPasswordUpdateFactors@LapsCore@",
    "?CheckAzurePasswordUpdateFactors@LapsCore@",
    "?CopyTimestampAttribute@LdapComputer@",
    "?CreateNewPassword@LocalAdminAccount@",
    "?DoADCoreProcessing@LapsCore@",
    "?DoAzureCoreProcessing@LapsCore@",
    "?DoAzureDiscoveryIfNeeded@LapsCore@",
    "?DoAzurePasswordUpdateHelper@LapsCore@",
    "?DoAzurePasswordUpdate@LapsCore@",
    "?DoCoreProcessing@LapsCore@",
    "?DoLDAPBind@LapsCore@",
    "?DoWork@LapsBackgroundOperation@",
    "?GetDeviceToken@",
    "?LibGetSystemTimeAsULONGLONG@",
    "?LoadNewADStateFromLdapResponse@LdapComputer@",
    "?LoadNewStateFromAD@LdapComputer@",
    "?LoadStateFromAD@LdapComputer@",
    "?ProcessResponse@WinHttpTransport@",
    "?ResetLocalAdminAccountPassword@AccountManager@",
    "?ResetPassword@LocalAdminAccount@",
    "?SendRequest@WinHttpTransport@",
    "?SendSynchronousWebRequest@LapsCore@",
    "?UpdateNewPasswordHelper@LdapComputer@",
    "?UpdateNewPassword@LdapComputer@",
    "?UpdateStateOnSuccess@AccountManager@"
]

def read_file(path):
    try:
        with open(path, 'r', encoding="utf-16") as f: 
            return f.readlines()
    except UnicodeDecodeError:
       raise ValueError("Failed to read file with supported encoding.")

def parse_symbol_addresses(file_path, symbol_list):
    lines = read_file(file_path)
    results = {}

    for symbol in symbol_list:
        for line in lines:
            if symbol in line:
                match = re.search(r"S_PUB32:\s+\[0001:(?P<addr>[0-9A-Fa-f]+)\]", line)
                if match:
                    offset_hex = match.group("addr")
                    final_address = 0x1000 + int(offset_hex, 16)
                    results[symbol] = f"0x{final_address:X}"
                break
        else:
            results[symbol] = "Not found"

    return results

def demangle(symbol):
    # Match the pattern and extract function and optional class
    match = re.match(r"\?(?P<func>\w+)(@(?P<class>\w+)@)?", symbol)
    if match:
        func = match.group("func")
        cls = match.group("class")
        if cls:
            return f"{cls}::{func}"
        else:
            return func
    else:
        return symbol  # Return unchanged if it doesn't match the expected pattern

def main():
    if len(sys.argv) < 2:
        print("Usage: python offset.py <cvdump_output_file_path> [output_file]")
        sys.exit(1)

    symbol_file_path = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None

    # Check if the file exists
    if not os.path.isfile(symbol_file_path):
        print(f"Error: File '{symbol_file_path}' does not exist.")
        sys.exit(1)

    output = []
    # Run the function and print results
    addresses = parse_symbol_addresses(symbol_file_path, symbols)
    for sym, addr in addresses.items():
        result = f"{demangle(sym)} => {addr}"
        print(result)
        output.append(result)
    if output_file:
        with open(output_file, "w") as f:
            for line in output:
                f.write(f"{line}\n")


if __name__ == "__main__":
    main()



