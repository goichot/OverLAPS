// dllmain.cpp : Defines the entry point for the DLL application.
#include "pch.h"
#include "Hook.h"

pSamISetPasswordForeignUser2 SamISetPasswordForeignUser2 = nullptr;

BOOL APIENTRY DllMain( HMODULE hModule,
                       DWORD  ul_reason_for_call,
                       LPVOID lpReserved
                     )
{
    switch (ul_reason_for_call)
    {
    case DLL_PROCESS_ATTACH:
        return AttachHook();
    case DLL_PROCESS_DETACH:
        return DetachHook();
    }
    return TRUE;
}

