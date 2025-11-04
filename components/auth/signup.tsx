'use client';

import AppLogo from '@/components/AppLogo'
import { author, currentYear } from '@/helpers'
import Link from 'next/link'
import { Button, Card, Col, Container, Form, FormControl, FormLabel, Row } from 'react-bootstrap';
import { signUpUser } from '@/actions/user-actions';
import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { TbArrowRight, TbEye, TbEyeOff } from 'react-icons/tb';

//export const metadata= { title: "Sign Up" }

const SignUpPage = () => {

  const [data, action] = useActionState(signUpUser, {
    success: false,
    message: '',
  });

  const [visible, setVisible] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  const SignInButton = () => {
    const { pending } = useFormStatus();
    return (
      <Button type='submit' disabled={pending} className="btn-primary fw-semibold py-2">
        {pending ? 'Signing Up...' : 'Sign Up'} 
        <TbArrowRight style={{ width: 20, height: 20 }} className="ms-1" />
      </Button>
    );
  };


    return (
            <Container>
                <Row className="justify-content-center">
                    <Col xxl={6} md={6} sm={8}>
                        <div className="auth-brand text-center mb-4">
                            <AppLogo />
                            <h4 className="fw-bold mt-3">Create an Account</h4>
                            <p className="text-muted w-lg-75 mx-auto">Let’s get you started. Create your account by entering your details below.</p>
                        </div>
                        <Card className="p-4 rounded-4">
                            <Form action={action} >
                                <div className="mb-3 form-group" >
                                    <FormLabel>
                                        First name: <span className="text-danger">*</span>
                                    </FormLabel>
                                    <FormControl 
                                    type="text" 
                                    id="first_name" 
                                    name='first_name' 
                                    required
                                    value={firstName} // 2. Bind value to state
                                    onChange={(e) => setFirstName(e.target.value)}  />
                                </div>
                                    <div className="mb-3 form-group" >
                                    <FormLabel>
                                        Last Name: <span className="text-danger">*</span>
                                    </FormLabel>
                                    <FormControl 
                                    type="text" 
                                    id="last_name" 
                                    name='last_name' 
                                    required
                                    value={lastName} // 2. Bind value to state
                                    onChange={(e) => setLastName(e.target.value)}  />
                                </div>
                                <div className="mb-3 form-group" >
                                    <FormLabel>
                                        Email address <span className="text-danger">*</span>
                                    </FormLabel>
                                    <FormControl 
                                    type="email" 
                                    id="email" 
                                    name='email' 
                                    required
                                    value={email} // 2. Bind value to state
                                    onChange={(e) => setEmail(e.target.value)}  />
                                </div>
                                <div className="mb-3 form-group" >
                                    <FormLabel>
                                        Password <span className="text-danger">*</span>
                                    </FormLabel>
                                    <div className="input-group">
                                    <FormControl 
                                    type={visible ? "text" : "password"} 
                                    id="password" 
                                    name='password'                                     
                                    required
                                    value={password} // 2. Bind value to state
                                    onChange={(e) => setPassword(e.target.value)}  />
                                     <span onClick={() => setVisible(!visible)} className='input-group-text cursor-pointer'>
                                        {!visible ? <TbEyeOff style={{ width: 18, height: 18 }} /> : <TbEye style={{ width: 18, height: 18 }} />} 
                                    </span>
                                </div>
                                </div>
                                <div className="d-grid">
                                    <SignInButton />
                                </div>
                            </Form>
                                {data && !data.success && (
                                        <div className='text-center text-danger'>{data.message}</div>
                                        )}

                            <p className="text-muted text-center mt-4 mb-0">
                                Have an account?{' '}
                                <Link href="/signin" className="text-secondary text-decoration-underline link-offset-3 fw-semibold">
                                    Sign In
                                </Link>
                            </p>
                        </Card>
                            <p className="text-center text-muted mt-4 mb-0">
                                © {currentYear} Developed — by <span className="fw-semibold">{author}</span>
                            </p>
                    </Col>
                </Row>
            </Container>
    )
}

export default SignUpPage