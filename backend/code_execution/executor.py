import subprocess
import tempfile
import os
import time
import signal
import psutil
from django.conf import settings
import docker
from typing import Dict, Any

class CodeExecutor:
    """
    Secure code execution service with Docker containers for isolation
    """
    
    # Language configurations
    LANGUAGE_CONFIGS = {
        'python': {
            'file_extension': '.py',
            'docker_image': 'python:3.9-alpine',
            'run_command': 'python',
            'timeout': 10
        },
        'javascript': {
            'file_extension': '.js',
            'docker_image': 'node:16-alpine',
            'run_command': 'node',
            'timeout': 10
        },
        'java': {
            'file_extension': '.java',
            'docker_image': 'openjdk:11-alpine',
            'compile_command': 'javac',
            'run_command': 'java',
            'timeout': 15
        },
        'cpp': {
            'file_extension': '.cpp',
            'docker_image': 'gcc:9-alpine',
            'compile_command': 'g++ -o solution',
            'run_command': './solution',
            'timeout': 15
        },
        'csharp': {
            'file_extension': '.cs',
            'docker_image': 'mcr.microsoft.com/dotnet/sdk:6.0-alpine',
            'compile_command': 'dotnet new console && mv Program.cs solution.cs && dotnet build',
            'run_command': 'dotnet run',
            'timeout': 20
        }
    }

    def __init__(self):
        self.docker_client = None
        try:
            self.docker_client = docker.from_env()
        except Exception:
            # Fallback to subprocess execution if Docker is not available
            pass

    def execute_code(self, language: str, code: str, input_data: str = "") -> Dict[str, Any]:
        """
        Execute code safely with resource limits and timeout
        """
        if language not in self.LANGUAGE_CONFIGS:
            return {
                'status': 'error',
                'output': '',
                'error': f'Unsupported language: {language}',
                'execution_time': 0,
                'memory_usage': 0
            }

        config = self.LANGUAGE_CONFIGS[language]
        
        if self.docker_client:
            return self._execute_with_docker(language, code, input_data, config)
        else:
            return self._execute_with_subprocess(language, code, input_data, config)

    def _execute_with_docker(self, language: str, code: str, input_data: str, config: Dict) -> Dict[str, Any]:
        """
        Execute code in a Docker container for maximum security
        """
        try:
            start_time = time.time()
            
            # Create temporary directory for code files
            with tempfile.TemporaryDirectory() as temp_dir:
                # Write code to file
                filename = f"solution{config['file_extension']}"
                file_path = os.path.join(temp_dir, filename)
                
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(code)
                
                # Prepare Docker run command
                volumes = {temp_dir: {'bind': '/workspace', 'mode': 'ro'}}
                working_dir = '/workspace'
                
                # Memory and CPU limits
                mem_limit = '128m'
                cpu_period = 100000
                cpu_quota = 50000  # 50% of one CPU core
                
                container = None
                try:
                    # Run container
                    container = self.docker_client.containers.run(
                        config['docker_image'],
                        command=f"{config['run_command']} {filename}",
                        volumes=volumes,
                        working_dir=working_dir,
                        mem_limit=mem_limit,
                        cpu_period=cpu_period,
                        cpu_quota=cpu_quota,
                        network_disabled=True,
                        remove=True,
                        detach=True,
                        stdin_open=True,
                        stdout=True,
                        stderr=True
                    )
                    
                    # Send input data if provided
                    if input_data:
                        container.exec_run(f"echo '{input_data}'", stdin=True)
                    
                    # Wait for completion with timeout
                    result = container.wait(timeout=config['timeout'])
                    
                    # Get output
                    logs = container.logs(stdout=True, stderr=True).decode('utf-8')
                    
                    execution_time = time.time() - start_time
                    
                    if result['StatusCode'] == 0:
                        return {
                            'status': 'completed',
                            'output': logs,
                            'error': '',
                            'execution_time': execution_time,
                            'memory_usage': 0  # Docker doesn't easily provide memory usage
                        }
                    else:
                        return {
                            'status': 'error',
                            'output': '',
                            'error': logs,
                            'execution_time': execution_time,
                            'memory_usage': 0
                        }
                        
                except Exception as e:
                    if container:
                        try:
                            container.stop(timeout=1)
                            container.remove()
                        except:
                            pass
                    
                    execution_time = time.time() - start_time
                    if execution_time >= config['timeout']:
                        return {
                            'status': 'timeout',
                            'output': '',
                            'error': f'Execution timed out after {config["timeout"]} seconds',
                            'execution_time': execution_time,
                            'memory_usage': 0
                        }
                    else:
                        return {
                            'status': 'error',
                            'output': '',
                            'error': str(e),
                            'execution_time': execution_time,
                            'memory_usage': 0
                        }
                        
        except Exception as e:
            return {
                'status': 'error',
                'output': '',
                'error': f'Docker execution failed: {str(e)}',
                'execution_time': 0,
                'memory_usage': 0
            }

    def _execute_with_subprocess(self, language: str, code: str, input_data: str, config: Dict) -> Dict[str, Any]:
        """
        Fallback execution using subprocess (less secure but works without Docker)
        """
        try:
            start_time = time.time()
            
            with tempfile.TemporaryDirectory() as temp_dir:
                # Write code to file
                filename = f"solution{config['file_extension']}"
                file_path = os.path.join(temp_dir, filename)
                
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(code)
                
                # Change to temp directory
                original_cwd = os.getcwd()
                os.chdir(temp_dir)
                
                try:
                    # Compile if needed
                    if 'compile_command' in config:
                        compile_cmd = config['compile_command'].split()
                        if language == 'java':
                            compile_cmd.append(filename)
                        elif language == 'cpp':
                            compile_cmd.append(filename)
                        
                        compile_process = subprocess.run(
                            compile_cmd,
                            capture_output=True,
                            text=True,
                            timeout=10
                        )
                        
                        if compile_process.returncode != 0:
                            return {
                                'status': 'error',
                                'output': '',
                                'error': f'Compilation error: {compile_process.stderr}',
                                'execution_time': time.time() - start_time,
                                'memory_usage': 0
                            }
                    
                    # Run the code
                    run_cmd = config['run_command'].split()
                    if language == 'python' or language == 'javascript':
                        run_cmd.append(filename)
                    elif language == 'java':
                        # For Java, we need to run the class name, not the file
                        class_name = filename.replace('.java', '')
                        run_cmd.append(class_name)
                    
                    process = subprocess.Popen(
                        run_cmd,
                        stdin=subprocess.PIPE,
                        stdout=subprocess.PIPE,
                        stderr=subprocess.PIPE,
                        text=True,
                        preexec_fn=os.setsid if os.name != 'nt' else None
                    )
                    
                    # Send input and get output with timeout
                    try:
                        stdout, stderr = process.communicate(
                            input=input_data,
                            timeout=config['timeout']
                        )
                        
                        execution_time = time.time() - start_time
                        
                        if process.returncode == 0:
                            return {
                                'status': 'completed',
                                'output': stdout,
                                'error': stderr if stderr else '',
                                'execution_time': execution_time,
                                'memory_usage': 0
                            }
                        else:
                            return {
                                'status': 'error',
                                'output': stdout,
                                'error': stderr,
                                'execution_time': execution_time,
                                'memory_usage': 0
                            }
                            
                    except subprocess.TimeoutExpired:
                        # Kill the process
                        if os.name != 'nt':
                            os.killpg(os.getpgid(process.pid), signal.SIGTERM)
                        else:
                            process.terminate()
                        
                        return {
                            'status': 'timeout',
                            'output': '',
                            'error': f'Execution timed out after {config["timeout"]} seconds',
                            'execution_time': config['timeout'],
                            'memory_usage': 0
                        }
                        
                finally:
                    os.chdir(original_cwd)
                    
        except Exception as e:
            return {
                'status': 'error',
                'output': '',
                'error': f'Execution failed: {str(e)}',
                'execution_time': time.time() - start_time if 'start_time' in locals() else 0,
                'memory_usage': 0
            }
