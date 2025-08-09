#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
INSTALADOR AUTOMÁTICO DEL SISTEMA DE TRADING IA
Versión: 2.0

Este script automatiza la instalación completa del sistema.
"""

import os
import sys
import subprocess
import platform
import urllib.request
import zipfile
import json
from pathlib import Path
import shutil

class TradingAIInstaller:
    def __init__(self):
        self.system = platform.system()
        self.python_version = sys.version_info
        self.installation_dir = Path.cwd()
        self.errors = []
        self.warnings = []
        self.venv_python = None
        self.venv_pip = None
        # Colores para terminal
        self.colors = {
            'RED': '\033[91m',
            'GREEN': '\033[92m',
            'YELLOW': '\033[93m',
            'BLUE': '\033[94m',
            'PURPLE': '\033[95m',
            'CYAN': '\033[96m',
            'WHITE': '\033[97m',
            'BOLD': '\033[1m',
            'END': '\033[0m'
        }

    def print_colored(self, text, color='WHITE'):
        if self.system == 'Windows':
            try:
                os.system('color')
            except:
                pass
        print(f"{self.colors[color]}{text}{self.colors['END']}")

    def check_python_version(self):
        self.print_colored("🔍 Verificando versión de Python...", 'BLUE')
        if self.python_version < (3, 8):
            self.errors.append(f"Python {self.python_version.major}.{self.python_version.minor} no soportado. Requiere Python 3.8+")
            return False
        self.print_colored(f"✅ Python {self.python_version.major}.{self.python_version.minor}.{self.python_version.micro} - OK", 'GREEN')
        return True

    def check_system_requirements(self):
        self.print_colored("🔍 Verificando requisitos del sistema...", 'BLUE')
        if self.system not in ['Windows', 'Linux', 'Darwin']:
            self.errors.append(f"Sistema operativo {self.system} no soportado")
            return False
        try:
            disk_usage = shutil.disk_usage(self.installation_dir)
            free_gb = disk_usage.free / (1024**3)
            if free_gb < 2:
                self.warnings.append(f"Poco espacio libre: {free_gb:.1f}GB (recomendado: 2GB+)")
        except:
            self.warnings.append("No se pudo verificar espacio en disco")
        self.print_colored(f"✅ Sistema {self.system} compatible", 'GREEN')
        return True

    def create_directory_structure(self):
        self.print_colored("📁 Creando estructura de directorios...", 'BLUE')
        directories = [
            'logs', 'data', 'models', 'config', 'scripts', 'tests', 'backups'
        ]
        for directory in directories:
            dir_path = self.installation_dir / directory
            dir_path.mkdir(exist_ok=True)
            self.print_colored(f"  📂 {directory}/", 'WHITE')
        self.print_colored("✅ Estructura de directorios creada", 'GREEN')

    def create_virtual_environment(self):
        self.print_colored("🐍 Creando entorno virtual...", 'BLUE')
        venv_path = self.installation_dir / 'trading_env'
        try:
            if venv_path.exists():
                self.print_colored("⚠️ Entorno virtual ya existe", 'YELLOW')
                response = input("¿Recrear entorno virtual? (y/N): ")
                if response.lower() == 'y':
                    shutil.rmtree(venv_path)
                else:
                    return True
            subprocess.run([sys.executable, '-m', 'venv', str(venv_path)], check=True, capture_output=True)
            self.print_colored("✅ Entorno virtual creado", 'GREEN')
            if self.system == 'Windows':
                self.venv_python = venv_path / 'Scripts' / 'python.exe'
                self.venv_pip = venv_path / 'Scripts' / 'pip.exe'
            else:
                self.venv_python = venv_path / 'bin' / 'python'
                self.venv_pip = venv_path / 'bin' / 'pip'
            return True
        except subprocess.CalledProcessError as e:
            self.errors.append(f"Error creando entorno virtual: {e}")
            return False

    def install_dependencies(self):
        self.print_colored("📦 Instalando dependencias...", 'BLUE')
        dependencies = [
            'MetaTrader5==5.0.45', 'pandas==2.1.4', 'numpy==1.24.3',
            'scikit-learn==1.3.2', 'requests==2.31.0', 'joblib==1.3.2',
            'colorama==0.4.6', 'python-telegram-bot==20.7', 'discord.py==2.3.2',
            'flask==3.0.0', 'flask-socketio==5.3.6', 'psutil==5.9.6',
            'schedule==1.2.0', 'plotly==5.17.0', 'ta-lib==0.4.28', 'yfinance==0.2.18'
        ]
        try:
            self.print_colored("  📦 Actualizando pip...", 'WHITE')
            subprocess.run([str(self.venv_pip), 'install', '--upgrade', 'pip'], check=True, capture_output=True)
            for dep in dependencies:
                self.print_colored(f"  📦 Instalando {dep}...", 'WHITE')
                try:
                    subprocess.run([str(self.venv_pip), 'install', dep], check=True, capture_output=True, timeout=300)
                except subprocess.TimeoutExpired:
                    self.warnings.append(f"Timeout instalando {dep}")
                except subprocess.CalledProcessError:
                    self.warnings.append(f"Error instalando {dep}")
            self.print_colored("✅ Dependencias instaladas", 'GREEN')
            return True
        except Exception as e:
            self.errors.append(f"Error instalando dependencias: {e}")
            return False

    def create_requirements_file(self):
        requirements_content = """# Sistema de Trading IA - Dependencias
MetaTrader5==5.0.45
pandas==2.1.4
numpy==1.24.3
scikit-learn==1.3.2
requests==2.31.0
joblib==1.3.2
colorama==0.4.6
python-telegram-bot==20.7
discord.py==2.3.2
flask==3.0.0
flask-socketio==5.3.6
psutil==5.9.6
schedule==1.2.0
plotly==5.17.0
ta-lib==0.4.28
yfinance==0.2.18
"""
        with open(self.installation_dir / 'requirements.txt', 'w') as f:
            f.write(requirements_content)
        self.print_colored("✅ Archivo requirements.txt creado", 'GREEN')

    def print_header(self):
        """Mostrar header de instalación"""
        header = """
    ╔══════════════════════════════════════════════════════════════╗
    ║                                                              ║
    ║       🤖 INSTALADOR SISTEMA DE TRADING IA v2.0 🤖          ║
    ║                                                              ║
    ║  Instalación automática de todas las dependencias           ║
    ║  y configuración del entorno de trading.                    ║
    ║                                                              ║
    ╚══════════════════════════════════════════════════════════════╝
        """
        self.print_colored(header, 'CYAN')

if __name__ == "__main__":
    installer = TradingAIInstaller()
    installer.print_header()
    if not installer.check_python_version():
        sys.exit(1)
    if not installer.check_system_requirements():
        sys.exit(1)
    installer.create_directory_structure()
    if not installer.create_virtual_environment():
        sys.exit(1)
    installer.create_requirements_file()
    if not installer.install_dependencies():
        sys.exit(1)
    print("\n🎉 Instalación completa. Revisa README.md para los siguientes pasos.")
