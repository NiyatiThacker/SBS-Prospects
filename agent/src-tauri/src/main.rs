// Prevents additional console window on Windows in both debug and release builds!
#![windows_subsystem = "windows"]

fn main() {
    agent_lib::run()
}
